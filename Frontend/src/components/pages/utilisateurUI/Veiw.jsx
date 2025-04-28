import React from 'react'

import {
  SheetClose, 
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,

} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function Veiw() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile here. Click save when you're done.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name"  className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter>
    </>
  );
}
