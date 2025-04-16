
import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row dark:bg-slate-900">
      {/* Left Side - Brand/Logo Section (matches Index.tsx) */}
      <div className="hidden md:flex md:w-1/2 gradient-bg dark:bg-none border-r border-r-gray p-4 sm:p-6 lg:p-10 items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full gradient-bg mb-2">
              <div className="text-white font-bold text-2xl">IF</div>
            </div>
            <h1 className="text-2xl font-bold text-white">InvoicesFlow</h1>
            <p className="mt-2 text-gray-100">
              {t("about.tagline")}
            </p>
          </div>
          
          <div className="space-y-6 text-white">
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <h3 className="font-medium text-lg mb-2">{t("about.forWhom")}</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("about.forAdmins")}</li>
                <li>{t("about.forManagers")}</li>
                <li>{t("about.forProviders")}</li>
                <li>{t("about.forFinance")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full md:w-1/2 p-4 sm:p-6 lg:p-10 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Back to Login Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-sm"
            >
              <Link to="/">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("about.backToLogin")}
              </Link>
            </Button>
          </div>

          {/* Mobile Logo (only visible on small screens) */}
          <div className="md:hidden text-center mb-6">
            <div className="inline-block p-3 rounded-full gradient-bg mb-2">
              <div className="text-white font-bold text-2xl">IF</div>
            </div>
            <h1 className="text-2xl font-bold dark:text-white">InvoicesFlow</h1>
          </div>

          <div className="space-y-8 animate-fade-in">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">{t("about.title")}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t("about.description")}
              </p>
            </section>

            {/* Features Section */}
            <section>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">
                {t("about.featuresTitle")}
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t("about.feature1")}</li>
                <li>{t("about.feature2")}</li>
                <li>{t("about.feature3")}</li>
                <li>{t("about.feature4")}</li>
                <li>{t("about.feature5")}</li>
              </ul>
            </section>

            {/* Workflow Section */}
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center dark:text-white">
                <span className="mr-2">🔁</span> {t("about.workflowTitle")}
              </h3>
              <ol className="space-y-2 pl-5 list-decimal text-gray-700 dark:text-gray-300">
                <li>{t("about.step1")}</li>
                <li>{t("about.step2")}</li>
                <li>{t("about.step3")}</li>
                <li>{t("about.step4")}</li>
                <li>{t("about.step5")}</li>
              </ol>
            </section>

            {/* Q&A Section */}
            <section>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t("about.qaTitle")}</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-left dark:text-white">
                    {t("about.q1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {t("about.a1")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger className="text-left dark:text-white">
                    {t("about.q2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {t("about.a2")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger className="text-left dark:text-white">
                    {t("about.q3")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {t("about.a3")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger className="text-left dark:text-white">
                    {t("about.q4")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {t("about.a4")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
