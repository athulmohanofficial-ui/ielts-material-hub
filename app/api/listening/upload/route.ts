import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    
    // Upload file to Supabase Storage
    const uploadToStorage = async (file: File | null, bucket: string, folder: string) => {
      if (!file || file.size === 0) return '';
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '31536000',
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return publicUrl;
    };

    // Get all files
    const files = {
      p1a: formData.get('part1_audio') as File,
      p2a: formData.get('part2_audio') as File,
      p3a: formData.get('part3_audio') as File,
      p4a: formData.get('part4_audio') as File,
      p1q: formData.get('part1_questions') as File,
      p2q: formData.get('part2_questions') as File,
      p3q: formData.get('part3_questions') as File,
      p4q: formData.get('part4_questions') as File,
      answer: formData.get('answer_key') as File, // NEW: answer key as file
    };

    // Upload all files
    const urls = await Promise.all([
      uploadToStorage(files.p1a, 'listening-audio', 'audio'),
      uploadToStorage(files.p2a, 'listening-audio', 'audio'),
      uploadToStorage(files.p3a, 'listening-audio', 'audio'),
      uploadToStorage(files.p4a, 'listening-audio', 'audio'),
      uploadToStorage(files.p1q, 'listening-questions', 'questions'),
      uploadToStorage(files.p2q, 'listening-questions', 'questions'),
      uploadToStorage(files.p3q, 'listening-questions', 'questions'),
      uploadToStorage(files.p4q, 'listening-questions', 'questions'),
      uploadToStorage(files.answer, 'listening-questions', 'answers'), // NEW: upload answer key
    ]);

    // Save to DB
    const { data, error } = await supabase.from('listening_tests').insert({
      title,
      part1_audio: urls[0],
      part2_audio: urls[1],
      part3_audio: urls[2],
      part4_audio: urls[3],
      part1_questions: urls[4],
      part2_questions: urls[5],
      part3_questions: urls[6],
      part4_questions: urls[7],
      answer_key: urls[8], // NEW: store answer key URL
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
