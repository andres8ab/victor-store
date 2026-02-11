
import FaqContent from "@/components/support/FaqContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Preguntas Frecuentes | Todo Eléctrico Victor",
    description: "Encuentra respuestas a las preguntas más comunes sobre Todo Eléctrico Victor.",
};

export default function FaqPage() {
    return (
        <div className="bg-light-100 min-h-screen py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-dark-900 mb-8 text-center">Preguntas Frecuentes</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-light-300">
                    <FaqContent />
                </div>
            </div>
        </div>
    );
}
