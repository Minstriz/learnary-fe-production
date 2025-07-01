import Navbar from "@/components/Navbar";
import Hero  from "@/components/Hero";
import ListTopic from "@/components/ListTopic";
export default function HomePage() {
  return (
    <div className="w-full flex-col gap-1">
      <Navbar/>
      <Hero/>
      <div className="w-full h-12 -mt-6 bg-gradient-to-b from-transparent via-white/60 to-white/90 backdrop-blur-md" />
      <ListTopic/>
    </div>
  );
}
