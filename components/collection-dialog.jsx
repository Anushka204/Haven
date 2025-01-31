"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
   
  } from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from './ui/input'
import { BarLoader } from 'react-spinners'
import { collectionSchema } from '@/app/lib/schema'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
const CollectionForm = ({onSuccess,open,setOpen,loading}) => {

    const {register,handleSubmit, formState:{errors},}=useForm({
resolver:zodResolver(collectionSchema),
defaultValues:{
    name:"",
    description:""
}
    })
    const onSubmit=handleSubmit(async(data)=>{
        onSuccess(data);
    })
  return (
    <Dialog open={open} onOpenChange={setOpen}>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>

    </DialogHeader>
    {loading && <BarLoader color="orange" width={"100%"}/>}
    <form onSubmit={onSubmit} className='space-y-2'>
        
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Collection Name</label>
        <Input disabled={loading} 
        {...register("name")}
        placeholder="Enter Collection name..."
        className={`${errors.title? "border-red-500":" "}`}
        />
        {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                  </div>
                  <div className='space-y-2'>
          <label className='text-sm font-medium'>Collection Name</label>
        <Textarea disabled={loading} 
        {...register("description")}
        placeholder="Describe your collection..."
        className={`${errors.title? "border-red-500":" "}`}
        />
        {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description.message}</p>
                  )}
                  </div>
                  <div className='flex justify-end gap-4'>
                    <Button type="button"
                    variant="ghost"
                    onClick={()=>setOpen(false)}
                    >Cancel</Button>
                    <Button type="submit" variant="journal">Create Collection</Button></div>
    </form>
  </DialogContent>
</Dialog>

  )
}

export default CollectionForm