"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios from "axios";

const page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounceValue(username, 300);
  const toast = useToast();
  const router = useRouter();

  //zod implementation
  const signin = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-unique-username?username=${debouncedUsername}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          setUsernameMessage("Error checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("onSubmit data", data);

      const response = await axios.post("/api/sign-up", data);
      toast.toast({
        title: "Success",
        description: response.data.message, // Fixed typo
      });
      router.replace(`/verify/${username}`);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error in sign up of user", error);
      toast.toast({
        title: "Sign up failed",
        description: error.message, // Fixed typo
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return <div></div>;
};
