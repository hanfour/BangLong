import NavBar from '@/components/front/NavBar';
import Footer from '@/components/front/Footer';

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <div className="pt-32 min-h-dvh">{children}</div>
      <Footer />
    </>
  );
}
