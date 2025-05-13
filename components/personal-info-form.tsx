"use client"

import type React from "react"

import { useState } from "react"
import { Info } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PersonalInfo {
  name: string
  sex: string
  cityAddress: string
  birthdate: string
  birthPlace: string
  residentialAddress: string
  civilStatus: string
  citizenship: string
  height: string
  weight: string
  religion: string
  contactNumber: string
  fatherName: string
  motherName: string
  languages: string[]
  emergencyPerson: string
  emergencyNumber: string
  skills: string[]
}

interface PersonalInfoFormProps {
  data: PersonalInfo
  updateData: (data: PersonalInfo) => void
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function PersonalInfoForm({ data, updateData, errors, setErrors }: PersonalInfoFormProps) {
  const [newLanguage, setNewLanguage] = useState("")
  const [newSkill, setNewSkill] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validation for height and weight - only allow positive numbers
    if (name === "height" || name === "weight") {
      // Only allow positive numbers
      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        setErrors((prev) => ({
          ...prev,
          [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} must be a positive number`,
        }))
        return
      }
    }

    updateData({
      ...data,
      [name]: value,
    })

    // Clear error when field is filled
    if (value.trim() && errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    updateData({
      ...data,
      [name]: value,
    })

    // Clear error when field is filled
    if (value && errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !data.languages.includes(newLanguage.trim())) {
      updateData({
        ...data,
        languages: [...data.languages, newLanguage.trim()],
      })
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    updateData({
      ...data,
      languages: data.languages.filter((l) => l !== language),
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      updateData({
        ...data,
        skills: [...data.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    updateData({
      ...data,
      skills: data.skills.filter((s) => s !== skill),
    })
  }

  const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor} className="flex items-center">
        {children} <span className="text-red-500 ml-1">*</span>
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p>This field is required</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )

  const OptionalLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <Label htmlFor={htmlFor}>{children}</Label>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="name">Full Name</RequiredLabel>
          <Input
            id="name"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="sex">Sex</RequiredLabel>
          <Select value={data.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
            <SelectTrigger id="sex" className={errors.sex ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <RequiredLabel htmlFor="cityAddress">City Address</RequiredLabel>
        <Input
          id="cityAddress"
          name="cityAddress"
          value={data.cityAddress}
          onChange={handleChange}
          placeholder="Enter your city address"
          className={errors.cityAddress ? "border-red-500" : ""}
        />
        {errors.cityAddress && <p className="text-sm text-red-500">{errors.cityAddress}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="birthdate">Birthdate</RequiredLabel>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            value={data.birthdate}
            onChange={handleChange}
            className={errors.birthdate ? "border-red-500" : ""}
          />
          {errors.birthdate && <p className="text-sm text-red-500">{errors.birthdate}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="birthPlace">Birth Place</RequiredLabel>
          <Input
            id="birthPlace"
            name="birthPlace"
            value={data.birthPlace}
            onChange={handleChange}
            placeholder="Enter your place of birth"
            className={errors.birthPlace ? "border-red-500" : ""}
          />
          {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="civilStatus">Civil Status</RequiredLabel>
          <Select value={data.civilStatus} onValueChange={(value) => handleSelectChange("civilStatus", value)}>
            <SelectTrigger id="civilStatus" className={errors.civilStatus ? "border-red-500" : ""}>
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Divorced">Divorced</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
          {errors.civilStatus && <p className="text-sm text-red-500">{errors.civilStatus}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <RequiredLabel htmlFor="residentialAddress">Residential Address</RequiredLabel>
        <Input
          id="residentialAddress"
          name="residentialAddress"
          value={data.residentialAddress}
          onChange={handleChange}
          placeholder="Enter your residential address"
          className={errors.residentialAddress ? "border-red-500" : ""}
        />
        {errors.residentialAddress && <p className="text-sm text-red-500">{errors.residentialAddress}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="citizenship">Citizenship</RequiredLabel>
          <Input
            id="citizenship"
            name="citizenship"
            value={data.citizenship}
            onChange={handleChange}
            placeholder="Enter your citizenship"
            className={errors.citizenship ? "border-red-500" : ""}
          />
          {errors.citizenship && <p className="text-sm text-red-500">{errors.citizenship}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="height">Height (cm)</RequiredLabel>
          <Input
            id="height"
            name="height"
            type="number"
            value={data.height}
            onChange={handleChange}
            placeholder="Enter your height"
            className={errors.height ? "border-red-500" : ""}
          />
          {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="weight">Weight (kg)</RequiredLabel>
          <Input
            id="weight"
            name="weight"
            type="number"
            value={data.weight}
            onChange={handleChange}
            placeholder="Enter your weight"
            className={errors.weight ? "border-red-500" : ""}
          />
          {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <OptionalLabel htmlFor="religion">Religion</OptionalLabel>
          <Input
            id="religion"
            name="religion"
            value={data.religion}
            onChange={handleChange}
            placeholder="Enter your religion"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="contactNumber">Contact Number</RequiredLabel>
          <Input
            id="contactNumber"
            name="contactNumber"
            value={data.contactNumber}
            onChange={handleChange}
            placeholder="Enter your contact number"
            className={errors.contactNumber ? "border-red-500" : ""}
          />
          {errors.contactNumber && <p className="text-sm text-red-500">{errors.contactNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="fatherName">Father's Name</RequiredLabel>
          <Input
            id="fatherName"
            name="fatherName"
            value={data.fatherName}
            onChange={handleChange}
            placeholder="Enter your father's name"
            className={errors.fatherName ? "border-red-500" : ""}
          />
          {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName}</p>}
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="motherName">Mother's Name</RequiredLabel>
          <Input
            id="motherName"
            name="motherName"
            value={data.motherName}
            onChange={handleChange}
            placeholder="Enter your mother's name"
            className={errors.motherName ? "border-red-500" : ""}
          />
          {errors.motherName && <p className="text-sm text-red-500">{errors.motherName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <OptionalLabel htmlFor="emergencyPerson">Emergency Contact Person</OptionalLabel>
          <Input
            id="emergencyPerson"
            name="emergencyPerson"
            value={data.emergencyPerson}
            onChange={handleChange}
            placeholder="Enter emergency contact person"
          />
        </div>
        <div className="space-y-2">
          <OptionalLabel htmlFor="emergencyNumber">Emergency Contact Number</OptionalLabel>
          <Input
            id="emergencyNumber"
            name="emergencyNumber"
            value={data.emergencyNumber}
            onChange={handleChange}
            placeholder="Enter emergency contact number"
          />
        </div>
      </div>
    </div>
  )
}
