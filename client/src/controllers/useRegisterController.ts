import { useState } from "react";

export function useRegisterController(onRegister: (name: string, password: string, email: string) => void) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "El nombre es requerido";
    else if (name.length < 3) newErrors.name = "El nombre debe tener al menos 3 caracteres";

    if (!password) newErrors.password = "La contraseña es requerida";
    else if (password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres";

    if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";

    if (!email.trim()) newErrors.email = "El correo electrónico es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(name, password, email);
    }
  };

  return {
    state: { name, password, confirmPassword, email, showPassword, showConfirmPassword, errors },
    setters: { setName, setPassword, setConfirmPassword, setEmail, setShowPassword, setShowConfirmPassword },
    onSubmit
  };
}
