import React from "react";
import { Metadata } from "next";
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Mail,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Terms of Service | " + APP_NAME,
  description:
    "Comprehensive guidelines for using " +
    APP_NAME +
    ", a single-player chess application.",
};

const TermsOfService = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Terms of Service for {APP_NAME}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thank you for choosing {APP_NAME}. These Terms of Service outline
            the rules and guidelines for using our chess application. By using
            {APP_NAME}, you agree to comply with these terms.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary">
              <span className="text-sm">Last Updated: March 2025</span>
            </div>
          </div>
        </div>

        <section className="space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing or using {APP_NAME}, you agree to be bound by
                  these Terms of Service. If you do not agree with any part of
                  these terms, you must not use the application.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                2. Usage Guidelines
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {APP_NAME} is designed for personal, non-commercial use. You
                  may use the application to play chess against computer
                  opponents at your own pace. The following guidelines apply:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You may not use the application for any illegal or
                    unauthorized purpose.
                  </li>
                  <li>You may not modify, adapt, or hack the application.</li>
                  <li>
                    You may not distribute or sell the application or any part
                    of it without prior written consent.
                  </li>
                  <li>
                    Please retain any copyright notices if you examine or modify
                    the code.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                3. App Functionality
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {APP_NAME} is a single-player chess application that allows
                  you to play against computer opponents. The application is
                  provided as-is, and while we strive to ensure a smooth
                  experience, occasional bugs or issues may arise. We appreciate
                  your understanding and patience as we work to improve the
                  application.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                4. Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In no event shall {APP_NAME} or its developers be liable for
                  any damages arising from the use or inability to use the
                  application, including but not limited to loss of data or
                  profits. Your use of the application is at your own risk.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-lg p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                5. Contact Information
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about this Terms of Service please
                  contact us at:
                </p>
                <div className="bg-background p-4 rounded-lg">
                  <p>Discord: @jhn322</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
