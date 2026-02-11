
import PrivacyContent from "@/components/legal/PrivacyContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidad | Todo Eléctrico Victor",
    description: "Política de privacidad de Todo Eléctrico Victor.",
};

export default function PrivacyPage() {
    return (
        <div className="bg-light-100 min-h-screen py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-dark-900 mb-8 text-center">Política de Privacidad</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-light-300">
                    <PrivacyContent />
                </div>
            </div>
        </div>
    );
}
