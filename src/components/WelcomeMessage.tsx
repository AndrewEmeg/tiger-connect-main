import React, { useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

const WelcomeMessage = () => {
    const { user } = useAuth();
    return (
        <h1>
            Welcome back,{" "}
            {user ? `${user.first_name} ${user.last_name}` : "Guest"}!
        </h1>
    );
};

export default WelcomeMessage;
