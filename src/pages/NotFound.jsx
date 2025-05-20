
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-lg mb-6 animate-float">
        <span className="text-white font-bold text-3xl">404</span>
      </div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Page introuvable
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md text-center">
        Désolé, nous ne trouvons pas la page que vous recherchez.
      </p>
      <Link to="/">
        <Button variant="default" size="lg" className="gap-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Retour à l'accueil</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
