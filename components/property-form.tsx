"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { addProperty, uploadPropertyImage } from "@/lib/firebase/properties"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Plus, Trash } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

// Add the assignedSaleMemberPhoto field to the schema
const propertyFormSchema = z.object({
  // Basic Info
  title: z.string().min(2, "Title must be at least 2 characters"),
  heading: z.string().min(2, "Heading must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  projectId: z.string().min(2, "Project ID must be at least 2 characters"),
  assignedSaleMember: z.string().optional(),
  companyName: z.string().optional(),
  assignedSaleMemberPhone: z.string().optional(),
  assignedSaleMemberPhoto: z.string().optional(),
  publishedBy: z.string(),
  // Property Type
  propertyType: z.string(),
  propertySubtype: z.string(),
  purpose: z.string(),
  listingIntent: z.string(),
  possessStatus: z.string(), // Renamed from status to possessStatus

  // Location
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  pincode: z.string().optional(),
  mapLink: z.string().optional(),
  locationImageUrl: z.string().optional(),

  // Pricing
  startingPrice: z.coerce.number().min(0, "Price must be 0 or more"),

  // Building Details
  floors: z.coerce.number().min(0, "Floors must be 0 or more"),
  towers: z.coerce.number().min(0, "Towers must be 0 or more"),
  wings: z.coerce.number().min(0, "Wings must be 0 or more"),
  basements: z.coerce.number().min(0, "Basements must be 0 or more"),
  podiumLevels: z.coerce.number().min(0, "Podium levels must be 0 or more"),

  // Parking
  parkingAvailable: z.boolean().default(false),

  // Construction Details
  constructionTechnology: z.string().optional(),
  builderDate: z.string().optional(),
  possessionDate: z.string().optional(),

  // Land Details
  landArea: z.string().optional(),

  // Legal
  reraNumber: z.string().optional(),
  reraDate: z.string().optional(),

  // Media
  detailsPdf: z.string().optional(),
  virtualTourLink: z.string().optional(),

  // Arrays (will handle these separately)
  amenities: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  nearbyPlaces: z
    .array(
      z.object({
        distance: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  paymentPlans: z.array(z.string()).optional(),
  unitTypes: z
    .array(
      z.object({
        additionalInfo: z.string().optional(),
        type: z.string(),
      }),
    )
    .optional(),
  keyFeatures: z.array(z.string()).optional(),

  // System fields
  published: z.boolean().default(true),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

const propertyTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land" },
]

// Define property subtypes based on property type
const propertySubtypesByType = {
  residential: [
    { value: "1-rk", label: "1 RK" },
    { value: "1-bhk", label: "1 BHK" },
    { value: "2-bhk", label: "2 BHK" },
    { value: "3-bhk", label: "3 BHK" },
    { value: "4-bhk", label: "4 BHK" },
    { value: "5-bhk", label: "5 BHK" },
    { value: "flat-apartment", label: "Flat/Apartment" },
    { value: "penthouse", label: "Penthouse" },
    { value: "row-house-duplex", label: "Row House/Duplex" },
    { value: "independent-bungalow-villa", label: "Independent Bungalow/Villa" },
    { value: "twin-flat", label: "Twin Flat" },
    { value: "studio-apartment", label: "Studio Apartment" },
    { value: "service-apartment", label: "Service Apartment" },
    { value: "terrace-flat", label: "Terrace Flat" },
  ],
  commercial: [
    { value: "office", label: "Office" },
    { value: "corporate-office", label: "Corporate Office" },
    { value: "warehouse-godown", label: "Warehouse/Godown" },
    { value: "industrial-shed", label: "Industrial Shed" },
    { value: "call-center", label: "Call Center" },
    { value: "it-office", label: "IT Office" },
    { value: "it-park", label: "IT Park" },
    { value: "shop", label: "Shop" },
    { value: "showroom", label: "Showroom" },
    { value: "hotel", label: "Hotel" },
    { value: "restaurant", label: "Restaurant" },
    { value: "commercial-land-plot", label: "Commercial Land/Plot" },
    { value: "commercial-building", label: "Commercial Building" },
    { value: "kiosk", label: "Kiosk" },
    { value: "hospital", label: "Hospital" },
    { value: "school", label: "School" },
    { value: "factory", label: "Factory" },
    { value: "classes", label: "Classes" },
  ],
  industrial: [
    { value: "industrial-gala", label: "Industrial Gala" },
    { value: "shop-in-retail-mall", label: "Shop in Retail Mall" },
    { value: "industrial-shed", label: "Industrial Shed" },
    { value: "industrial-building", label: "Industrial Building" },
    { value: "industrial-land", label: "Industrial Land" },
    { value: "factory", label: "Factory" },
    { value: "warehouse", label: "Warehouse" },
  ],
  land: [
    { value: "residential-land-plot", label: "Residential Land/Plot" },
    { value: "agricultural-land-plot", label: "Agricultural Land/Plot" },
    { value: "commercial-land-plot", label: "Commercial Land/Plot" },
    { value: "industrial-land", label: "Industrial Land" },
    { value: "na-land-plot", label: "NA Land/Plot" },
    { value: "farm-house", label: "Farm House" },
    { value: "land-plot", label: "Land/Plot" },
    { value: "terrace-flat", label: "Terrace Flat" },
  ],
}

const purposeTypes = [
  { value: "sell", label: "Sell" },
  { value: "resale", label: "Resale" },
  { value: "rental", label: "Rental" },
  { value: "new project", label: "New Project" },
]

const listingIntents = [
  { value: "sell", label: "Sell" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
  { value: "new-project", label: "New Project" },
]

const propertyStatuses = [
  { value: "sale", label: "Sale" },
  { value: "sold", label: "Sold" },
  { value: "pre-launch", label: "Pre-Launch" },
  { value: "launch", label: "Launch" },
  { value: "under-construction", label: "Under Construction" },
  { value: "ready-to-move", label: "Ready to Move" },
]

const commonAmenities = [
  "Fitness Centre",
  "Rooftop Garden",
  "Swimming Pool",
  "Clubhouse",
  "Children's Play Area",
  "Landscaped Gardens",
  "24x7 Security",
  "Power Backup",
  "Parking",
  "Lift",
  "Rainwater Harvesting",
  "Visitor Parking",
  "Jogging Track",
  "Indoor Games",
  "Multipurpose Hall",
]

export function PropertyForm() {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [highlights, setHighlights] = useState<string[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<{ distance: string; name: string }[]>([])
  const [paymentPlans, setPaymentPlans] = useState<string[]>([])
  const [unitTypes, setUnitTypes] = useState<
    {
      type: string
      additionalInfo?: string
      bathrooms?: number
      bedrooms?: number
      price?: number
      size?: number
    }[]
  >([])
  const [videos, setVideos] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")
  const [newHighlight, setNewHighlight] = useState("")
  const [newPaymentPlan, setNewPaymentPlan] = useState("")
  const [newVideo, setNewVideo] = useState("")
  const [newNearbyPlace, setNewNearbyPlace] = useState({ distance: "", name: "" })
  const [newUnitType, setNewUnitType] = useState({
    type: "",
    additionalInfo: "",
    bathrooms: 0,
    bedrooms: 0,
    price: 0,
    size: 0,
  })
  const [keyFeatures, setKeyFeatures] = useState<string[]>([])
  const [newKeyFeature, setNewKeyFeature] = useState("")
  const [availableSubtypes, setAvailableSubtypes] = useState<{ value: string; label: string }[]>([])
  // Add this state for tracking form submission errors at the top of the component, after other state declarations
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfFileInputRef = useRef<HTMLInputElement>(null)
  // Add a ref for the file input
  const saleMemberPhotoRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Add the field to the form defaultValues
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      heading: "",
      description: "",
      projectName: "",
      projectId: "", // Added Project ID field
      assignedSaleMember: "",
      companyName: "",
      assignedSaleMemberPhone: "",
      assignedSaleMemberPhoto: "",
      propertyType: "residential",
      propertySubtype: "flat-apartment",
      purpose: "new-project",
      listingIntent: "sell",
      possessStatus: "sale", // Renamed from status to possessStatus
      address: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      mapLink: "",
      locationImageUrl: "",
      startingPrice: 0,
      floors: 0,
      towers: 1,
      wings: 0,
      basements: 0,
      podiumLevels: 0,
      parkingAvailable: false,
      constructionTechnology: "",
      builderDate: "TBD",
      possessionDate: "TBD",
      landArea: "",
      reraNumber: "",
      reraDate: "",
      detailsPdf: "",
      virtualTourLink: "",
      published: false,
      publishedBy: ""
    },
  })

  // Update available subtypes when property type changes
  useEffect(() => {
    const propertyType = form.watch("propertyType")
    const subtypes = propertySubtypesByType[propertyType as keyof typeof propertySubtypesByType] || []
    setAvailableSubtypes(subtypes)

    // Set default subtype when property type changes
    if (subtypes.length > 0) {
      form.setValue("propertySubtype", subtypes[0].value)
    }
  }, [form.watch("propertyType"), form])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Create a temporary ID for the property (will be replaced with the actual ID after property creation)
      const tempId = `temp_${Date.now()}`

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await uploadPropertyImage(file, tempId)

        if (result.success) {
          setUploadedImages((prev) => [...prev, result.url])
        } else {
          toast({
            title: "Upload failed",
            description: result.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const file = files[0]
      const tempId = `temp_${Date.now()}`
      const result = await uploadPropertyImage(file, tempId)

      if (result.success) {
        form.setValue("detailsPdf", result.url)
      } else {
        toast({
          title: "PDF upload failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "PDF upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (pdfFileInputRef.current) {
        pdfFileInputRef.current.value = ""
      }
    }
  }

  // Add a function to handle the sales member photo upload
  const handleSaleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const tempId = `temp_${Date.now()}`
      const file = files[0]
      const result = await uploadPropertyImage(file, tempId)

      if (result.success) {
        form.setValue("assignedSaleMemberPhoto", result.url)
        toast({
          title: "Upload successful",
          description: "Sales member photo has been uploaded",
        })
      } else {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Photo upload error:", error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (saleMemberPhotoRef.current) {
        saleMemberPhotoRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addAmenity = () => {
    if (newAmenity.trim() !== "") {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index))
  }

  const addHighlight = () => {
    if (newHighlight.trim() !== "") {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight("")
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const addPaymentPlan = () => {
    if (newPaymentPlan.trim() !== "") {
      setPaymentPlans([...paymentPlans, newPaymentPlan.trim()])
      setNewPaymentPlan("")
    }
  }

  const removePaymentPlan = (index: number) => {
    setPaymentPlans(paymentPlans.filter((_, i) => i !== index))
  }

  const addVideo = () => {
    if (newVideo.trim() !== "") {
      setVideos([...videos, newVideo.trim()])
      setNewVideo("")
    }
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const addNearbyPlace = () => {
    if (newNearbyPlace.distance.trim() !== "" && newNearbyPlace.name.trim() !== "") {
      setNearbyPlaces([...nearbyPlaces, { ...newNearbyPlace }])
      setNewNearbyPlace({ distance: "", name: "" })
    }
  }

  const removeNearbyPlace = (index: number) => {
    setNearbyPlaces(nearbyPlaces.filter((_, i) => i !== index))
  }

  const addUnitType = () => {
    if (newUnitType.type.trim() === "") {
      toast({
        title: "Unit Type Required",
        description: "Please enter a unit type (e.g. 2 BHK) before adding",
        variant: "destructive",
      })
      return
    }

    setUnitTypes([...unitTypes, { ...newUnitType }])
    setNewUnitType({ type: "", additionalInfo: "", bathrooms: 0, bedrooms: 0, price: 0, size: 0 })

    // Confirmation toast
    toast({
      title: "Unit Type Added",
      description: `Added ${newUnitType.type} successfully`,
    })
  }

  const removeUnitType = (index: number) => {
    setUnitTypes(unitTypes.filter((_, i) => i !== index))
  }

  const addKeyFeature = () => {
    if (newKeyFeature.trim() !== "") {
      setKeyFeatures([...keyFeatures, newKeyFeature.trim()])
      setNewKeyFeature("")
    }
  }

  const removeKeyFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index))
  }

  // Replace the onSubmit function with this updated version
  const onSubmit = async (data: PropertyFormValues) => {
    // Clear any previous errors
    setFormError(null)
    setIsSubmitting(true)

    try {
      console.log("Starting property submission process...")

      // Add arrays and images to the property data
      const propertyData = {
        ...data,
        images: uploadedImages,
        amenities,
        highlights,
        nearbyPlaces,
        paymentPlans,
        unitTypes,
        videos,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        keyFeatures,
        // Explicitly include these fields to ensure they're saved
        listingIntent: data.listingIntent,
        locationImageUrl: data.locationImageUrl || "",
        mapLink: data.mapLink || "",
        status: data.possessStatus, // Map possessStatus back to status for backward compatibility
        virtualTourLink: data.virtualTourLink || "",
        assignedSaleMemberPhoto: data.assignedSaleMemberPhoto || "", // Ensure photo field is included
        publishedBy: data.publishedBy
      }

      console.log("Prepared property data for submission:", propertyData)

      // Try to save directly to Firestore as a fallback
      try {
        console.log("Attempting to save property using addProperty function...")
        const result = await addProperty(propertyData)

        if (result.success) {
          console.log("Property saved successfully with ID:", result.id)
          toast({
            title: "Property added",
            description: "The property has been successfully added",
          })
          router.push("/dashboard/properties/dashboard")
        } else {
          console.error("Error from addProperty function:", result.error)
          // Show detailed error in toast and set form error
          const errorMessage = result.error || "Failed to add property. Please check your form inputs."
          setFormError(errorMessage)
          toast({
            title: "Error adding property",
            description: errorMessage,
            variant: "destructive",
            duration: 5000, // Show for longer time
          })
          // Scroll to top to show the error
          window.scrollTo({ top: 0, behavior: "smooth" })
          return
        }
      } catch (addPropertyError) {
        console.error("Error in addProperty function, trying direct Firestore save:", addPropertyError)

        // Show error from first attempt
        const primaryErrorMessage =
          addPropertyError instanceof Error
            ? addPropertyError.message
            : "Error with primary save method. Trying alternative..."

        setFormError(primaryErrorMessage)
        toast({
          title: "Error with primary save method",
          description: primaryErrorMessage,
          variant: "destructive",
          duration: 3000,
        })

        try {
          // Fallback: Try to save directly to Firestore
          const docRef = await addDoc(collection(db, "properties"), {
            ...propertyData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          console.log("Property saved directly to Firestore with ID:", docRef.id)
          toast({
            title: "Property added",
            description: "The property has been successfully added using fallback method",
          })
          router.push("/dashboard/properties/dashboard")
        } catch (fallbackError) {
          console.error("Error in fallback save method:", fallbackError)
          const fallbackErrorMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : "Failed to add property with both methods. Please check your form inputs."

          setFormError(fallbackErrorMessage)
          toast({
            title: "Error adding property",
            description: fallbackErrorMessage,
            variant: "destructive",
            duration: 5000,
          })
          // Scroll to top to show the error
          window.scrollTo({ top: 0, behavior: "smooth" })
          return
        }
      }
    } catch (error: any) {
      console.error("Final error in property submission:", error)
      const errorMessage = error.message || "An unexpected error occurred while adding the property."
      setFormError(errorMessage)
      toast({
        title: "Error adding property",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for longer time
      })
      // Scroll to top to show the error
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find the navigateTab function and replace it with this enhanced version
  // that validates the current tab before allowing navigation

  // Replace the existing navigateTab function with this one
  const navigateTab = (tab: string) => {
    // If trying to navigate forward, validate the current tab first
    if (
      (activeTab === "basic" && tab === "details") ||
      (activeTab === "details" && tab === "building") ||
      (activeTab === "building" && tab === "features") ||
      (activeTab === "features" && tab === "location") ||
      (activeTab === "location" && tab === "media")
    ) {
      // Define which fields to validate for each tab
      const fieldsToValidate: Record<string, string[]> = {
        basic: ["title", "heading", "description", "projectName", "projectId", "startingPrice"],
        details: ["propertyType", "propertySubtype", "purpose", "listingIntent", "possessStatus"],
        building: ["floors", "towers", "wings", "basements", "podiumLevels"],
        features: [], // No required fields in features tab
        location: ["address", "city", "state", "country"],
        media: [], // No required fields in media tab
      }

      // Trigger validation only for the fields in the current tab
      const currentTabFields = fieldsToValidate[activeTab]

      // Use form.trigger to validate only specific fields
      form.trigger(currentTabFields as any).then((isValid) => {
        if (isValid) {
          // If validation passes, navigate to the next tab
          setActiveTab(tab)
        } else {
          // If validation fails, show a toast and don't navigate
          toast({
            title: "Validation Error",
            description: "Please fix the errors in this tab before proceeding",
            variant: "destructive",
          })

          // Force error display for the current tab's fields
          currentTabFields.forEach((field) => {
            form.trigger(field as any)
          })
        }
      })
    } else {
      // If navigating backward or to a non-adjacent tab, allow without validation
      setActiveTab(tab)
    }
  }

  // Add this error alert at the beginning of the form, right after the <form> tag
  // Add this right after the opening <form> tag in the return statement
  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            <h3 className="text-lg font-semibold">Error Saving Property</h3>
            <p>{formError}</p>
          </div>
        )}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-4">
            <h3 className="text-lg font-semibold">Please fix the following errors:</h3>
            <ul className="list-disc pl-5 mt-2">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field} >
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Property Details</TabsTrigger>
            {form.watch("purpose") === "new project" && (
              <TabsTrigger value="building">Building Details</TabsTrigger>
            )}
            {/* <TabsTrigger value="building">Building Details</TabsTrigger> */}
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input id="title" placeholder="e.g. Gurukrupa Dhyanam" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="heading">Heading</Label>
                      <Input id="heading" placeholder="e.g. Gurukrupa Dhyanam" {...form.register("heading")} />
                      {form.formState.errors.heading && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.heading.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input id="projectName" placeholder="e.g. Gurukrupa Dhyanam" {...form.register("projectName")} />
                      {form.formState.errors.projectName && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.projectName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="projectId">Project ID</Label>
                      <Input id="projectId" placeholder="e.g. GD-2023" {...form.register("projectId")} />
                      {form.formState.errors.projectId && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.projectId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="assignedSaleMember">Assigned Sale Member</Label>
                      <Input
                        id="assignedSaleMember"
                        placeholder="e.g. John Doe"
                        {...form.register("assignedSaleMember")}
                      />
                      {form.formState.errors.assignedSaleMember && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.assignedSaleMember.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="assignedSaleMemberPhone">Sale Member Phone</Label>
                      <Input
                        id="assignedSaleMemberPhone"
                        placeholder="e.g. +91 9876543210"
                        {...form.register("assignedSaleMemberPhone")}
                      />
                      {form.formState.errors.assignedSaleMemberPhone && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.assignedSaleMemberPhone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g. Gurukrupa Realcon Builders"
                        {...form.register("companyName")}
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.companyName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Sales Member Photo</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                        {form.watch("assignedSaleMemberPhoto") ? (
                          <img
                            src={form.watch("assignedSaleMemberPhoto") || "/placeholder.svg"}
                            alt="Sales Member"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No photo</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={saleMemberPhotoRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleSaleMemberPhotoUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => saleMemberPhotoRef.current?.click()}
                          disabled={isUploading}
                          className="mb-2"
                        >
                          {isUploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                        {form.watch("assignedSaleMemberPhoto") && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue("assignedSaleMemberPhoto", "")}
                            className="text-destructive"
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="publishedBy">Published By</Label>
                    <Input
                      id="publishedBy"
                      placeholder="e.g. John Doe"
                      {...form.register("publishedBy")}
                    />
                    {form.formState.errors.publishedBy && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.publishedBy.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter property description"
                      className="min-h-32"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startingPrice">Starting Price (₹)</Label>
                      <Input
                        id="startingPrice"
                        type="number"
                        min="0"
                        placeholder="e.g. 1000000"
                        {...form.register("startingPrice")}
                      />
                      {form.formState.errors.startingPrice && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.startingPrice.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Published</Label>
                        <p className="text-sm text-muted-foreground">Make this property visible on the website</p>
                      </div>
                      <Switch
                        checked={form.watch("published")}
                        onCheckedChange={(checked) => form.setValue("published", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => navigateTab("details")} className="flex items-center gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        onValueChange={(value) => form.setValue("propertyType", value)}
                        defaultValue={form.watch("propertyType")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.propertyType && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.propertyType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="propertySubtype">Property Subtype</Label>
                      <Select
                        onValueChange={(value) => form.setValue("propertySubtype", value)}
                        value={form.watch("propertySubtype")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property subtype" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="relative">
                            <Input
                              className="sticky top-0 mb-2 rounded-sm border"
                              placeholder="Search property subtype..."
                              onChange={(e) => {
                                const searchInput = e.target.value.toLowerCase()
                                const filteredItems = document.querySelectorAll("[data-subtype-item]")
                                filteredItems.forEach((item) => {
                                  const itemText = item.textContent?.toLowerCase() || ""
                                  if (itemText.includes(searchInput)) {
                                    ; (item as HTMLElement).style.display = "block"
                                  } else {
                                    ; (item as HTMLElement).style.display = "none"
                                  }
                                })
                              }}
                            />
                          </div>
                          {availableSubtypes.map((subtype) => (
                            <SelectItem key={subtype.value} value={subtype.value} data-subtype-item>
                              {subtype.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.propertySubtype && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.propertySubtype.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* <div>
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input id="projectId" placeholder="e.g. GD-2023" {...form.register("projectId")} />
                    {form.formState.errors.projectId && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.projectId.message}
                      </p>
                    )}
                  </div> */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purpose">Purpose</Label>
                      <Select
                        onValueChange={(value) => form.setValue("purpose", value)}
                        defaultValue={form.watch("purpose")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {purposeTypes.map((purpose) => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.purpose && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.purpose.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="listingIntent">Listing Intent</Label>
                      <Select
                        onValueChange={(value) => form.setValue("listingIntent", value)}
                        defaultValue={form.watch("listingIntent")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing intent" />
                        </SelectTrigger>
                        <SelectContent>
                          {listingIntents.map((intent) => (
                            <SelectItem key={intent.value} value={intent.value}>
                              {intent.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.listingIntent && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.listingIntent.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="possessStatus">Possess Status</Label>
                    <Select
                      onValueChange={(value) => form.setValue("possessStatus", value)}
                      defaultValue={form.watch("possessStatus")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select possess status" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.possessStatus && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.possessStatus.message}
                      </p>
                    )}
                  </div>

                  {form.watch("purpose") === "new project" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="constructionTechnology">Construction Technology</Label>
                        <Input
                          id="constructionTechnology"
                          placeholder="e.g. MIVAN Technology"
                          {...form.register("constructionTechnology")}
                        />
                        {form.formState.errors.constructionTechnology && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.constructionTechnology.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="landArea">Land Area</Label>
                        <Input
                          id="landArea"
                          placeholder="e.g. Approx 1200 sq meter plot area"
                          {...form.register("landArea")}
                        />
                        {form.formState.errors.landArea && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.landArea.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label>Unit Types</Label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit-type">Unit Type</Label>
                          <Input
                            id="unit-type"
                            placeholder="e.g. 2 BHK"
                            value={newUnitType.type}
                            onChange={(e) => setNewUnitType({ ...newUnitType, type: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit-additional-info">Additional Info</Label>
                          <Input
                            id="unit-additional-info"
                            placeholder="e.g. Well-designed layout"
                            value={newUnitType.additionalInfo || ""}
                            onChange={(e) => setNewUnitType({ ...newUnitType, additionalInfo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit-bedrooms">Bedrooms</Label>
                          <Input
                            id="unit-bedrooms"
                            type="number"
                            placeholder="Number of bedrooms"
                            value={newUnitType.bedrooms || 0}
                            onChange={(e) =>
                              setNewUnitType({ ...newUnitType, bedrooms: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit-bathrooms">Bathrooms</Label>
                          <Input
                            id="unit-bathrooms"
                            type="number"
                            placeholder="Number of bathrooms"
                            value={newUnitType.bathrooms || 0}
                            onChange={(e) =>
                              setNewUnitType({ ...newUnitType, bathrooms: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unit-size">Size (sq ft)</Label>
                          <Input
                            id="unit-size"
                            type="number"
                            placeholder="Size in square feet"
                            value={newUnitType.size || 0}
                            onChange={(e) =>
                              setNewUnitType({ ...newUnitType, size: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit-price">Price (₹)</Label>
                          <Input
                            id="unit-price"
                            type="number"
                            placeholder="Price in rupees"
                            value={newUnitType.price || 0}
                            onChange={(e) =>
                              setNewUnitType({ ...newUnitType, price: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>

                      <Button type="button" onClick={addUnitType} size="sm" className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" /> Add Unit Type
                      </Button>

                      {unitTypes.length > 0 && (
                        <div className="rounded-md border">
                          <div className="divide-y">
                            {unitTypes.map((unit, index) => (
                              <div key={index} className="flex items-center justify-between p-3">
                                <div className="space-y-1">
                                  <div className="font-medium">{unit.type}</div>
                                  {unit.additionalInfo && (
                                    <div className="text-sm text-muted-foreground">{unit.additionalInfo}</div>
                                  )}
                                  <div className="text-sm">
                                    <span className="font-medium">Bedrooms:</span> {unit.bedrooms} •
                                    <span className="font-medium ml-2">Bathrooms:</span> {unit.bathrooms} •
                                    <span className="font-medium ml-2">Size:</span> {unit.size} sq ft •
                                    <span className="font-medium ml-2">Price:</span> ₹{unit.price?.toLocaleString()}
                                  </div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeUnitType(index)}>
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateTab("basic")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button type="button" onClick={() => navigateTab("building")} className="flex items-center gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {form.watch("purpose") === "new project" && (
            <TabsContent value="building" className="space-y-4 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    {/* all your inputs: floors, towers, wings, etc. */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="floors">Floors</Label>
                        <Input id="floors" type="number" min="0" {...form.register("floors")} />
                        {form.formState.errors.floors && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.floors.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="towers">Towers</Label>
                        <Input id="towers" type="number" min="0" {...form.register("towers")} />
                        {form.formState.errors.towers && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.towers.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="wings">Wings</Label>
                        <Input id="wings" type="number" min="0" {...form.register("wings")} />
                        {form.formState.errors.wings && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.wings.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="basements">Basements</Label>
                        <Input id="basements" type="number" min="0" {...form.register("basements")} />
                        {form.formState.errors.basements && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.basements.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Parking Available</Label>
                          <p className="text-sm text-muted-foreground">Does this property have parking facilities?</p>
                        </div>
                        <Switch
                          checked={form.watch("parkingAvailable")}
                          onCheckedChange={(checked) => form.setValue("parkingAvailable", checked)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builderDate">Builder Date</Label>
                        <Input id="builderDate" placeholder="e.g. TBD" {...form.register("builderDate")} />
                        {form.formState.errors.builderDate && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.builderDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="possessionDate">Possession Date</Label>
                        <Input id="possessionDate" placeholder="e.g. TBD" {...form.register("possessionDate")} />
                        {form.formState.errors.possessionDate && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.possessionDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reraNumber">RERA Number</Label>
                        <Input id="reraNumber" placeholder="e.g. P51800055801" {...form.register("reraNumber")} />
                        {form.formState.errors.reraNumber && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.reraNumber.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="reraDate">RERA Date</Label>
                        <Input id="reraDate" placeholder="e.g. 15/03/2023" {...form.register("reraDate")} />
                        {form.formState.errors.reraDate && (
                          <p className="text-sm font-medium text-destructive mt-1">
                            {form.formState.errors.reraDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigateTab("details")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => navigateTab("features")}
                  className="flex items-center gap-2"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          )}

          <TabsContent value="features" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-amenity">Add Amenity</Label>
                        <div className="flex gap-2">
                          <Input
                            id="new-amenity"
                            placeholder="e.g. Swimming Pool"
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addAmenity()
                              }
                            }}
                          />
                          <Button type="button" onClick={addAmenity} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Common Amenities</Label>
                        <Select
                          onValueChange={(value) => {
                            if (!amenities.includes(value)) {
                              setAmenities([...amenities, value])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select common amenity" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonAmenities.map((amenity) => (
                              <SelectItem key={amenity} value={amenity}>
                                {amenity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {amenities.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div>{amenity}</div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeAmenity(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Highlights</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Premium Finishes"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addHighlight()
                          }
                        }}
                      />
                      <Button type="button" onClick={addHighlight} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {highlights.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div>{highlight}</div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeHighlight(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Key Features</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Vastu Compliant"
                        value={newKeyFeature}
                        onChange={(e) => setNewKeyFeature(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addKeyFeature()
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyFeature} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {keyFeatures.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {keyFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div>{feature}</div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeKeyFeature(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Payment Plans</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. 20:30:50 Payment Plan"
                        value={newPaymentPlan}
                        onChange={(e) => setNewPaymentPlan(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addPaymentPlan()
                          }
                        }}
                      />
                      <Button type="button" onClick={addPaymentPlan} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {paymentPlans.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {paymentPlans.map((plan, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div>{plan}</div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removePaymentPlan(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Nearby Places</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nearby-place-name">Place Name</Label>
                        <Input
                          id="nearby-place-name"
                          placeholder="e.g. Metro Station"
                          value={newNearbyPlace.name}
                          onChange={(e) => setNewNearbyPlace({ ...newNearbyPlace, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nearby-place-distance">Distance</Label>
                        <Input
                          id="nearby-place-distance"
                          placeholder="e.g. 500m"
                          value={newNearbyPlace.distance}
                          onChange={(e) => setNewNearbyPlace({ ...newNearbyPlace, distance: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addNearbyPlace()
                            }
                          }}
                        />
                      </div>
                    </div>

                    <Button type="button" onClick={addNearbyPlace} size="sm" className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" /> Add Nearby Place
                    </Button>

                    {nearbyPlaces.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {nearbyPlaces.map((place, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div>
                                <span className="font-medium">{place.name}</span> - {place.distance}
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeNearbyPlace(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateTab("building")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button type="button" onClick={() => navigateTab("location")} className="flex items-center gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter full address" {...form.register("address")} />
                    {form.formState.errors.address && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="floors">Floor</Label>
                    <Input id="floors" type="number" min="0" {...form.register("floors")} />
                    {form.formState.errors.floors && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.floors.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="e.g. Mumbai" {...form.register("city")} />
                      {form.formState.errors.city && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="e.g. Maharashtra" {...form.register("state")} />
                      {form.formState.errors.state && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="e.g. India" {...form.register("country")} />
                      {form.formState.errors.country && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" placeholder="e.g. 400001" {...form.register("pincode")} />
                      {form.formState.errors.pincode && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mapLink">Google Maps Link</Label>
                    <Input id="mapLink" placeholder="Paste Google Maps URL" {...form.register("mapLink")} />
                    {form.formState.errors.mapLink && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.mapLink.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="locationImageUrl">Location Image URL</Label>
                    <Input
                      id="locationImageUrl"
                      placeholder="URL to location image"
                      {...form.register("locationImageUrl")}
                    />
                    {form.formState.errors.locationImageUrl && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.locationImageUrl.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateTab("features")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button type="button" onClick={() => navigateTab("media")} className="flex items-center gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label>Property Images</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        {isUploading ? "Uploading..." : "Upload Images"}
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        {uploadedImages.length} {uploadedImages.length === 1 ? "image" : "images"} uploaded
                      </div>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative group rounded-md overflow-hidden">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Property ${index + 1}`}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="flex items-center gap-1"
                              >
                                <Trash className="h-4 w-4" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Property Videos</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="YouTube or Vimeo URL"
                        value={newVideo}
                        onChange={(e) => setNewVideo(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addVideo()
                          }
                        }}
                      />
                      <Button type="button" onClick={addVideo} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {videos.length > 0 && (
                      <div className="rounded-md border">
                        <div className="divide-y">
                          {videos.map((video, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div className="truncate max-w-[500px]">{video}</div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeVideo(index)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="virtualTourLink">Virtual Tour Link</Label>
                    <Input
                      id="virtualTourLink"
                      placeholder="URL to virtual tour"
                      {...form.register("virtualTourLink")}
                    />
                    {form.formState.errors.virtualTourLink && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.virtualTourLink.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Details PDF</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        ref={pdfFileInputRef}
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => pdfFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        {isUploading ? "Uploading..." : "Upload PDF"}
                      </Button>
                      {form.watch("detailsPdf") && (
                        <div className="text-sm text-muted-foreground">PDF uploaded successfully</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateTab("location")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Saving...
                  </>
                ) : (
                  "Save Property"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
