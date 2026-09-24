import { Toaster } from "sonner";
import Home from "./Home";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Home />
    </>
  );
}
