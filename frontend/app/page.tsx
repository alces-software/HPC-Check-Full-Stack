
import HomePage from "./components/Home"
import Header from "./components/Header"

export const metadata = {
  title: "Portal"
};

export default function Home() {
  return (
    <main>
      <Header />
      <HomePage />
    </main>
  );
}