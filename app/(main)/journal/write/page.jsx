"use client"
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import {Controller, useForm} from "react-hook-form"
import { journalSchema } from '@/app/lib/schema';
import "react-quill-new/dist/quill.snow.css";
import {BarLoader} from "react-spinners"
import { getDraft } from '@/actions/journal';
import CollectionForm from '@/components/collection-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMoodById, MOODS } from '@/app/lib/moods';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { createJournalEntry, saveDraft, updateJournalEntry } from '@/actions/journal';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createCollection,getCollections } from '@/actions/collection';
import { getJournalEntry } from '@/actions/journal';
import { Loader2, Watch } from 'lucide-react';


const ReactQuill=dynamic(()=>import("react-quill-new"),{ssr:false})
const JournalEntryPage = () => {

  const[isCollectionDialogOpen,setIsCollectionDialogOpen]=useState(false);
const searchParams=useSearchParams();
const editId=searchParams.get("edit");
const [isEditMode,setIsEditMode]=useState(false);


const{
  loading:entryLoading,
  fn:fetchEntry,
  data:existingEntry,
}=useFetch(getJournalEntry);

const{
  loading:draftLoading,
  data:draftData,
  fn:fetchDraft,
}=useFetch(getDraft);

const {loading:savingDraft, fn:saveDraftFn,data:savedDraft}=useFetch(saveDraft);

  const{
    loading:actionLoading,
    fn:actionFn,
    data:actionResult,
  }=useFetch(isEditMode ? updateJournalEntry: createJournalEntry );

  const{
    loading:collectionsLoading,
    fn:fetchCollections,
    data:collections,
  }=useFetch(getCollections);

  const{
    loading:createCollectionLoading,
    fn:createCollectionFn,
    data:createdCollection,
  }=useFetch(createCollection);


const router=useRouter();

const{register,handleSubmit,control,formState:{errors,isDirty },getValues,setValue,reset,watch}=useForm({
  resolver:zodResolver(journalSchema),
  defaultValues:{
    title:"",
    content:"",
    mood:" ",
    collectionId:"",
  }
});
useEffect(()=>{
  fetchCollections();
if(editId){
  setIsEditMode(true);
  fetchEntry();
}
else{
  setIsEditMode(false);
  fetchDraft();
}
},[editId]);

// Handle setting form data from draft
useEffect(() => {
  if (isEditMode && existingEntry) {
    reset({
      title: existingEntry.title || "",
      content: existingEntry.content || "",
      mood: existingEntry.mood || "",
      collectionId: existingEntry.collectionId || "",
    });
  } else if (draftData?.success && draftData?.data) {
    reset({
      title: draftData.data.title || "",
      content: draftData.data.content || "",
      mood: draftData.data.mood || "",
      collectionId: "",
    });
  } else {
    reset({
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    });
  }
}, [draftData, isEditMode, existingEntry]);

// Handle collection creation success
useEffect(() => {
  if (createdCollection) {
    setIsCollectionDialogOpen(false);
    fetchCollections();
    setValue("collectionId", createdCollection.id);
    toast.success(`Collection ${createdCollection.name} created!`);
  }
}, [createdCollection]);

useEffect(() => {
  if(actionResult && !actionLoading){
    router.push(
      `/collection/${
        actionResult.collectionId ? actionResult.collectionId : "unorganized"
      }`
    );
    toast.success(`Entry Created Successfully`);
  }
},[actionResult,actionLoading]);


const onSubmit=handleSubmit(async(data)=>{


const mood=getMoodById(data.mood);

actionFn({
  ...data,
  moodScore:mood.score,
  moodQuery:mood.pixabayQuery,
  ...(isEditMode && {id:editId}),
})
});
useEffect(()=>{
  if(createdCollection){
    setIsCollectionDialogOpen(false);
fetchCollections();
setValue("collectionId",createdCollection.id);
toast.success(`Collection ${createdCollection.name} created!`);
}
},[createCollection]);

const handleCreateCollection=async(data)=>{
  createCollectionFn(data)
}
const formData=watch();

const handleSaveDraft=async()=>{
  if(!isDirty){
    toast.error("No changes to save");
    return;
  }
  await saveDraftFn(formData);
 
};
useEffect(()=>{
  if(savedDraft?.success && !savingDraft){
    toast.success("Draft saved successfully")
   }
},[savedDraft,savingDraft]);

const isLoading=actionLoading || collectionsLoading || entryLoading || draftLoading || savingDraft;
  return (
    <div className='py-8'>
      <form className='space-y-2 mx-auto' onSubmit={onSubmit}>
      <h1 className='text-5xl md:text-6xl gradient-title'>
        {isEditMode ? "Edit Entry" : "What's on your mind?"}
</h1>
  {isLoading && <BarLoader color="orange" width={"100%"}/>}

<div className='space-y-2'>
  <label className='text-sm font-medium'>Title</label>
<Input disabled={isLoading} 
{...register("title")}
placeholder="Give your entry a title..."
className={`py-5 md:text-md 
${errors.title? "border-red-500":" "}`}
/>
{errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
</div>

<div className='space-y-2'>
  <label className='text-sm font-medium'>How are you feeling?</label>
<Controller
name="mood"
control={control}
render={({field})=>{

return <Select onValueChange={field.onChange} value={field.value}>
<SelectTrigger className={errors.mood?"border-red-500" : ""}>
  <SelectValue placeholder="Select a Mood" />
</SelectTrigger>

<SelectContent>
  {Object.values(MOODS).map((mood)=>{
return (<SelectItem key={mood.id} value={mood.id}>
<span className='flex items-center gap-2'>{mood.emoji}{mood.label}</span></SelectItem>
);
  })}
  <SelectItem value="light">Light</SelectItem>

</SelectContent>
</Select>
}}
/>
 {errors.mood && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
</div>



<div className='space-y-2'>
  <label className='text-sm font-medium'>{getMoodById(getValues("mood"))?.prompt??"Write your thoughts..."}</label>
<Controller
name="content"
control={control}
render={({field})=>(
  <ReactQuill readOnly={isLoading} theme="snow"
  value={field.value}
  onChange={field.onChange}
  modules={{
    toolbar:[
      [{header:[1,2,3,false]}],
      ['bold', 'italic', 'underline','strike'],
      [{list:"ordered"},{list:"bullet"}],
      ["blockquote","code-block"],
      ["link"],
      ["clean"],
    ],
  }}></ReactQuill>
)}
/>
 {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
</div>

<div className='space-y-2'>
  <label className='text-sm font-medium'>
    Add to Collection (Optional)
  </label>
  <Controller
name="collectionId"
control={control}
render={({field})=>{

return <Select onValueChange={(value)=>{
  if(value==='new'){
    setIsCollectionDialogOpen(true )
  }else{
    field.onChange(value);
  }
  }} value={field.value}>
<SelectTrigger>
  <SelectValue placeholder="Choose a collection..." />
</SelectTrigger>

<SelectContent>
  {collections?.map((collection)=>{
return (<SelectItem key={collection.id} value={collection.id}>
  {collection.name}
</SelectItem>
);
  })}

  <SelectItem value="new">
    <span className='text-orange-600'>
      + Create New Collection
      </span>
      </SelectItem>
</SelectContent>
</Select>
}}
/>
 {errors.collectionId && (
            <p className="text-red-500 text-sm">{errors.collectionId.message}</p>
          )}
</div>

<div className='space-x-4 flex'>
{!isEditMode && (
      <Button onClick={handleSaveDraft}
      type="button"
      variant="outline"
      disabled={savingDraft || !isDirty}>
        {savingDraft && <Loader2 className='mr-2 h-4 w-4 animate-spin'/>}
        Save as Draft
      </Button>
    )}
  <Button type="submit" variant="journal" disabled={actionLoading}>
    {isEditMode ? "Update" : "Publish"}
  </Button>

    {isEditMode && (
      <Button onClick={(e)=>{
        e.preventDefault();
        router.push(`/journal/${existingEntry.id}`);
      }}
      variant="destructive">Cancel</Button>
    )}
    </div>
      </form>

      <CollectionForm
      loading={createCollectionLoading}
      onSuccess={handleCreateCollection} open={isCollectionDialogOpen}
      setOpen={setIsCollectionDialogOpen}/> 
      </div>
  )
}

export default JournalEntryPage