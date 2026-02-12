import AdminPanel from '@/components/admin/adminPanel'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | CodeBeauty",
  description: "Admin panel for managing CodeBeauty tools and content.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <AdminPanel/>
  )
}

export default page