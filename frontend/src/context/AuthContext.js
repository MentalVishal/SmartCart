import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartcart_user"));
    } catch {
      return null;
    }
  });

  const loginUser = (data) => {
    localStorage.setItem("smartcart_user", JSON.stringify(data));
    setUser(data);
  };

  const logoutUser = () => {
    localStorage.removeItem("smartcart_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
