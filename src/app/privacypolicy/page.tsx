import React from "react";
import { Metadata } from "next";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Server,
  Clock,
  UserCheck,
  Mail,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: `Privacy Policy for ${APP_NAME} - Learn how we protect your data and privacy.`,
};

const PrivacyPolicy = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            At {APP_NAME}, we value your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, and safeguard your data.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Last Updated: March 2025</span>
            </div>
          </div>
        </div>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect information that you provide directly to us when
                  you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sign in using third-party Google authentication</li>
                  <li>Play chess games on our platform</li>
                  <li>
                    Interact with features such as saving games or viewing game
                    history
                  </li>
                </ul>
                <p>
                  This information may include your name, email address, game
                  history, preferences, and any other information you choose to
                  provide.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Develop new features and services</li>
                  <li>
                    Monitor and analyze trends, usage, and activities in
                    connection with our services
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Information Sharing
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not share your personal information with third parties
                  except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>If asked by you</li>
                  <li>
                    With service providers who perform services on our behalf
                    such as MongoDB
                  </li>
                  <li>To comply with legal obligations</li>
                  <li>
                    To protect the rights, property, or safety of {APP_NAME},
                    our users, or others
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We take reasonable measures to help protect your personal
                  information from loss, theft, misuse, unauthorized access,
                  disclosure, alteration, and destruction. However, no security
                  system is impenetrable, and we cannot guarantee the security
                  of our systems or your information.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Your Rights and Choices
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You have several rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Access and update your information through your account
                    settings
                  </li>
                  <li>Deletion of your account with all associated data</li>
                  <li>Object to the processing of your personal information</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. If we
                  make material changes, we will notify you through a notice on
                  our website prior to the changes becoming effective.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us at:
                </p>
                <div className="bg-background p-4 rounded-lg">
                  <p>Discord: jhn322</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
