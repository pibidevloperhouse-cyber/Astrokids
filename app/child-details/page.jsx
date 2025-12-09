import ChildDetailsComponents from "@/components/ChildDetailsComponent";

export default async function ChildDetailsPage() {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect(`/auth/redirect?callbackUrl=/child-details`);
  // }

  return <ChildDetailsComponents session={""} />;
}
