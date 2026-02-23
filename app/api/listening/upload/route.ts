import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const answerKey = formData.get('answer_key') as string;
    
    const part1Audio = formData.get('part1_audio') as File;
    const part2Audio = formData.get('part2_audio') as File;
    const part3Audio = formData.get('part3_audio') as File;
    const part4Audio = formData.get('part4_audio') as File;
    
    const part1Questions = formData.get('part1_questions') as File;
    const part2Questions = formData.get('part2_questions') as File;
    const part3Questions = formData.get('part3_questions') as File;
    const part4Questions = formData.get('part4_questions') as File;

    const uploadFile = async (file: File | null, bucket: string, folder: string) => {
      if (!file || file.size === 0) return '';
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return publicUrl;
    };

    const [
      part1AudioUrl, part2AudioUrl, part3AudioUrl, part4AudioUrl,
      part1QuestionsUrl, part2QuestionsUrl, part3QuestionsUrl, part4QuestionsUrl
    ] = await Promise.all([
      uploadFile(part1Audio, 'listening-audio', 'audio'),
      uploadFile(part2Audio, 'listening-audio', 'audio'),
      uploadFile(part3Audio, 'listening-audio', 'audio'),
      uploadFile(part4Audio, 'listening-audio', 'audio'),
      uploadFile(part1Questions, 'listening-questions', 'questions'),
      uploadFile(part2Questions, 'listening-questions', 'questions'),
      uploadFile(part3Questions, 'listening-questions', 'questions'),
      uploadFile(part4Questions, 'listening-questions', 'questions'),
    ]);

    const { data, error } = await supabase
      .from('listening_tests')
      .insert({
        title,
        part1_audio: part1AudioUrl,
        part2_audio: part2AudioUrl,
        part3_audio: part3AudioUrl,
        part4_audio: part4AudioUrl,
        part1_questions: part1QuestionsUrl,
        part2_questions: part2QuestionsUrl,
        part3_questions: part3QuestionsUrl,
        part4_questions: part4QuestionsUrl,
        answer_key: answerKey,
      });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
