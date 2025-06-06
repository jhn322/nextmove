"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { AuthFormProps, AuthFormData } from "./types";
import { loginSchema } from "@/lib/validations/auth/login";
import { registerFormSchema } from "@/lib/validations/auth/register";
import { Loader2 } from "lucide-react";

const getValidationSchema = (mode: "login" | "register") => {
  return mode === "login" ? loginSchema : registerFormSchema;
};

type FormValues = AuthFormData;

export const AuthForm = ({
  mode,
  onSubmit,
  isLoading = false,
  error,
}: AuthFormProps) => {
  const validationSchema = getValidationSchema(mode);

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = form.handleSubmit(
    async (data) => {
      const submitData =
        mode === "register"
          ? { name: data.name, email: data.email, password: data.password }
          : data;
      await onSubmit(submitData as AuthFormData);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
    }
  );

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {mode === "register" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your Name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  {...field}
                  disabled={isLoading}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mode === "register" && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {error && (
          <div className="text-destructive text-sm text-center pt-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
};
