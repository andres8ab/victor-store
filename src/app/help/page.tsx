
import HelpContent from "@/components/support/HelpContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ayuda y Soporte | Todo Eléctrico Victor",
    description: "Centro de ayuda y soporte de Todo Eléctrico Victor.",
};

export default function HelpPage() {
    return (
        <div className="bg-light-100 min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-dark-900 mb-8 text-center">Ayuda y Soporte</h1>
                <HelpContent />
            </div>
        </div>
    );
}
