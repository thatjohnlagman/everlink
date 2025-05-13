"use server"

import { v4 as uuidv4 } from "uuid"
import { getSupabaseAdmin } from "@/lib/supabase"

// Type definitions based on our database schema
type PersonalInfo = {
  name: string
  sex: "Male" | "Female" | "Other"
  cityAddress: string
  birthdate: string
  birthPlace: string
  residentialAddress: string
  civilStatus: "Single" | "Married" | "Widowed" | "Other"
  citizenship: string
  height: string
  weight: string
  religion?: string
  contactNumber: string
  fatherName: string
  motherName: string
  emergencyPerson?: string
  emergencyNumber?: string
  languages?: string[]
  skills?: string[]
}

type Education = {
  id: string
  level: string
  school: string
  yearGraduated: string
}

type Employment = {
  id: string
  position: string
  company: string
  startDate: string
  endDate?: string
  location?: string
  responsibilities?: string
  achievements?: string
}

type CharacterReference = {
  id: string
  name: string
  occupation: string
  company: string
  relatedEmploymentId: string
}

export async function submitApplication(formData: FormData) {
  try {
    const supabase = getSupabaseAdmin()

    // Parse form data
    const personalData = JSON.parse(formData.get("personalInfo") as string) as PersonalInfo
    const educationData = JSON.parse(formData.get("education") as string) as Education[]
    const employmentData = JSON.parse(formData.get("employment") as string) as Employment[]
    const referencesData = JSON.parse(formData.get("references") as string) as CharacterReference[]
    const position = formData.get("position") as string

    // Generate IDs
    const personId = uuidv4()
    const applicantId = uuidv4()

    // Insert personal profile
    const { error: profileError } = await supabase.from("personal_profiles").insert({
      person_id: personId,
      applicant_id: applicantId,
      name: personalData.name,
      sex: personalData.sex,
      city_address: personalData.cityAddress,
      residential_address: personalData.residentialAddress,
      birth_date: personalData.birthdate,
      birth_place: personalData.birthPlace,
      civil_status: personalData.civilStatus,
      citizenship: personalData.citizenship,
      height: Number.parseFloat(personalData.height),
      weight: Number.parseFloat(personalData.weight),
      religion: personalData.religion || null,
      cellphone_number: personalData.contactNumber,
      father_name: personalData.fatherName,
      mother_name: personalData.motherName,
      emergency_contact_name: personalData.emergencyPerson || null,
      emergency_contact_number: personalData.emergencyNumber || null,
      languages: personalData.languages || [],
      skills: personalData.skills || [],
    })

    if (profileError) throw new Error(`Profile error: ${profileError.message}`)

    // Insert education records
    const educIds: string[] = []

    for (const edu of educationData) {
      const educId = uuidv4()
      educIds.push(educId)

      const { error: educError } = await supabase.from("education").insert({
        educ_id: educId,
        person_id: personId,
        education_level: edu.level,
        school: edu.school,
        year_graduated: new Date(edu.yearGraduated).toISOString().split("T")[0],
      })

      if (educError) throw new Error(`Education error: ${educError.message}`)
    }

    // Insert character references and employment records
    const employmentIds: string[] = []

    for (const emp of employmentData) {
      const employmentId = uuidv4()
      employmentIds.push(employmentId)

      // Find related references
      const relatedRefs = referencesData.filter((ref) => ref.relatedEmploymentId === emp.id)
      let characterReferenceId = null

      // Insert references if any
      if (relatedRefs.length > 0) {
        const ref = relatedRefs[0]
        characterReferenceId = uuidv4()

        const { error: refError } = await supabase.from("character_references").insert({
          character_reference_id: characterReferenceId,
          reference_name: ref.name,
          reference_occupation: ref.occupation,
          reference_company: ref.company,
        })

        if (refError) throw new Error(`Reference error: ${refError.message}`)
      }

      // Insert employment
      const { error: empError } = await supabase.from("employment").insert({
        employment_id: employmentId,
        person_id: personId,
        character_reference_id: characterReferenceId,
        position: emp.position,
        company: emp.company,
        occupation_start: new Date(emp.startDate).toISOString().split("T")[0],
        occupation_end: emp.endDate ? new Date(emp.endDate).toISOString().split("T")[0] : null,
      })

      if (empError) throw new Error(`Employment error: ${empError.message}`)
    }

    // Handle file uploads
    const resumeFile = formData.get("resume") as File
    const coverLetterFile = formData.get("coverLetter") as File
    const supportingMaterialsFile = formData.get("supportingMaterials") as File

    let resumeUrl = null
    let coverLetterUrl = null
    let supportingMaterialsUrl = null

    // Use the applications bucket we created
    const bucketName = "applications"

    if (resumeFile && resumeFile.size > 0) {
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from(bucketName)
        .upload(`${personId}/resume-${resumeFile.name}`, resumeFile)

      if (resumeError) throw new Error(`Resume upload error: ${resumeError.message}`)
      resumeUrl = resumeData?.path
    }

    if (coverLetterFile && coverLetterFile.size > 0) {
      const { data: coverData, error: coverError } = await supabase.storage
        .from(bucketName)
        .upload(`${personId}/cover-${coverLetterFile.name}`, coverLetterFile)

      if (coverError) throw new Error(`Cover letter upload error: ${coverError.message}`)
      coverLetterUrl = coverData?.path
    }

    if (supportingMaterialsFile && supportingMaterialsFile.size > 0) {
      const { data: supportingData, error: supportingError } = await supabase.storage
        .from(bucketName)
        .upload(`${personId}/supporting-${supportingMaterialsFile.name}`, supportingMaterialsFile)

      if (supportingError) throw new Error(`Supporting materials upload error: ${supportingError.message}`)
      supportingMaterialsUrl = supportingData?.path
    }

    // Create application record
    const appId = uuidv4()
    const { error: appError } = await supabase.from("applications").insert({
      app_id: appId,
      person_id: personId,
      educ_id: educIds.length > 0 ? educIds[0] : null,
      employment_id: employmentIds.length > 0 ? employmentIds[0] : null,
      submission_date: new Date().toISOString().split("T")[0],
      status: "Submitted",
      resume_url: resumeUrl,
      cover_letter_url: coverLetterUrl,
      supporting_materials_url: supportingMaterialsUrl,
    })

    if (appError) throw new Error(`Application error: ${appError.message}`)

    return { success: true, applicationId: appId }
  } catch (error) {
    console.error("Application submission error:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getApplicationStatus(applicationId: string) {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from("applications")
      .select(`
        app_id,
        submission_date,
        status,
        personal_profiles(name, cellphone_number)
      `)
      .eq("app_id", applicationId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching application status:", error)
    return { success: false, error: (error as Error).message }
  }
}
