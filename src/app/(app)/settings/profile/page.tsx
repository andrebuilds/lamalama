import type { Metadata } from "next"

import {
  DeleteAccountButton,
  MascotPicker,
  ProfilePhotoField,
} from "@/features/account"
import { ProfileForm, SignOutButton } from "@/features/auth"
import { getCurrentWorkspace } from "@/features/workspaces"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfileSettingsPage() {
  const { user } = await getCurrentWorkspace()

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear in LamaLama.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ProfilePhotoField
            name={user.name}
            email={user.email}
            image={user.image}
          />
          <ProfileForm currentName={user.name} />
          <Field data-disabled>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <Input id="profile-email" value={user.email} disabled readOnly />
            <FieldDescription>
              You sign in with this address. It can’t be changed yet.
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mascot</CardTitle>
          <CardDescription>
            Pick the llama that keeps you company in your user menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MascotPicker current={user.mascot ?? null} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Sign out of LamaLama on this device.
          </CardDescription>
        </CardHeader>
        {/* CardFooter keeps the button at its natural width. */}
        <CardFooter>
          <SignOutButton />
        </CardFooter>
      </Card>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently deletes your account, your personal workspace and every
            workspace you own.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <DeleteAccountButton email={user.email} />
        </CardFooter>
      </Card>
    </div>
  )
}
