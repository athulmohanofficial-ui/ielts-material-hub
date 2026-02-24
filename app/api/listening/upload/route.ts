import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This bypasses RLS
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    
    // Upload files to storage
    const uploadFile = async (file: File, bucket: string) => {
      if (!file) return null
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file)
      
      if (error) throw error
      return path
    }

    // Upload all files
    const part1_audio = await uploadFile(formData.get('part1_audio') as File, 'listening-audio')
    const part2_audio = await uploadFile(formData.get('part2_audio') as File, 'listening-audio')
    const part3_audio = await uploadFile(formData.get('part3_audio') as File, 'listening-audio')
    const part4_audio = await uploadFile(formData.get('part4_audio') as File, 'listening-audio')
    
    const part1_questions = await uploadFile(formData.get('part1_questions') as File, 'listening-questions')
    const part2_questions = await uploadFile(formData.get('part2_questions') as File, 'listening-questions')
    const part3_questions = await uploadFile(formData.get('part3_questions') as File, 'listening-questions')
    const part4_questions = await uploadFile(formData.get('part4_questions') as File, 'listening-questions')
    
    const answer_key = await uploadFile(formData.get('answer_key') as File, 'listening-answers')

    // Insert into database
    const { error: dbError } = await supabase
      .from('listening_tests')
      .insert({
        title,
        part1_audio,
        part2_audio,
        part3_audio,
        part4_audio,
        part1_questions,
        part2_questions,
        part3_questions,
        part4_questions,
        answer_key
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
