
import { Mail, Phone, MapPin, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';

export default function HelpContent() {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Contact Cards */}
                <div className="p-6 rounded-2xl bg-light-100 border border-light-300">
                    <div className="w-12 h-12 rounded-full bg-dark-900 text-light-100 flex items-center justify-center mb-4">
                        <Phone size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-900 mb-2">Llámanos</h3>
                    <p className="text-dark-700 text-sm">
                        Estamos disponibles de Lunes a Sábado<br />
                        8:00 AM - 6:00 PM
                        <br />
                        Domingos de 9:00 AM - 1:00 PM
                    </p>
                    <a href="tel:+573003725519" className="mt-4 block text-dark-900 font-medium hover:underline">
                        +57 300 372 5519
                    </a>
                </div>

                <div className="p-6 rounded-2xl bg-light-100 border border-light-300">
                    <div className="w-12 h-12 rounded-full bg-dark-900 text-light-100 flex items-center justify-center mb-4">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-900 mb-2">Escríbenos</h3>
                    <p className="text-dark-700 text-sm">
                        Envíanos tus dudas y te responderemos<br />
                        en menos de 24 horas.
                    </p>
                    <a href="mailto:todoelectricovictor@gmail.com" className="mt-4 block text-dark-900 font-medium hover:underline">
                        todoelectricovictor@gmail.com
                    </a>
                </div>

                <div className="p-6 rounded-2xl bg-light-100 border border-light-300">
                    <div className="w-12 h-12 rounded-full bg-dark-900 text-light-100 flex items-center justify-center mb-4">
                        <MapPin size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-900 mb-2">Visítanos</h3>
                    <p className="text-dark-700 text-sm">
                        Carrera 38 #43-07<br />
                        Barranquilla, Colombia
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-900">Información Importante</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <Truck className="text-dark-900" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-dark-900">Envíos y Entregas</h3>
                            <p className="mt-2 text-dark-700">
                                Realizamos envíos a todo el país. El tiempo de procesamiento es de 24 horas hábiles.
                                El costo del envío se calcula al momento de finalizar la compra basado en tu ubicación.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <RefreshCcw className="text-dark-900" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-dark-900">Cambios y Devoluciones</h3>
                            <p className="mt-2 text-dark-700">
                                Tienes 5 días hábiles después de recibir tu pedido para solicitar un cambio.
                                El producto debe estar en su empaque original y sin señales de uso.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <ShieldCheck className="text-dark-900" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-dark-900">Garantía</h3>
                            <p className="mt-2 text-dark-700">
                                Nuestros productos cuentan con garantía legal. Para hacerla efectiva, debes presentar la factura de compra.
                                La garantía cubre defectos de fabricación, no mal uso o instalación incorrecta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
