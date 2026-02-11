import { Accordion, AccordionTab } from 'primereact/accordion';

export default function FaqContent() {
    return (
        <div className="space-y-4">
            <p className="text-dark-700 mb-6">
                Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.
            </p>

            <Accordion activeIndex={0} className="w-full">
                <>
                    <AccordionTab header="¿Cuáles son los tiempos de envío?">
                        <p className="m-0 text-dark-700">
                            Los envíos nacionales generalmente toman de 2 a 5 días hábiles, dependiendo de la ubicación.
                            Para ciudades principales como Bogotá, Medellín y Cali, el tiempo suele ser menor.
                            Recibirás un número de guía para rastrear tu pedido una vez sea despachado. Y en Barranquilla tenemos servicio de entrega inmediata.
                        </p>
                    </AccordionTab>
                    <AccordionTab header="¿Ofrecen garantía en repuestos eléctricos?">
                        <p className="m-0 text-dark-700">
                            Sí, todos nuestros productos cuentan con garantía por defectos de fábrica.
                            Sin embargo, debido a la naturaleza de los repuestos eléctricos, la garantía no cubre daños
                            causados por mala instalación o sobrecargas eléctricas externas. Recomendamos que la instalación
                            sea realizada por un técnico calificado.
                        </p>
                    </AccordionTab>
                    <AccordionTab header="¿Cómo puedo rastrear mi pedido?">
                        <p className="m-0 text-dark-700">
                            Una vez tu pedido sea enviado, recibirás un correo electrónico con el número de guía y el enlace
                            de la transportadora para realizar el seguimiento en tiempo real.
                        </p>
                    </AccordionTab>
                    <AccordionTab header="¿Hacen envíos internacionales?">
                        <p className="m-0 text-dark-700">
                            Actualmente operamos principalmente en Colombia. Para envíos internacionales, por favor contáctanos
                            directamente a través de nuestro formulario de contacto para evaluar la posibilidad y costos.
                        </p>
                    </AccordionTab>
                    <AccordionTab header="¿Qué métodos de pago aceptan?">
                        <p className="m-0 text-dark-700">
                            Aceptamos tarjetas de crédito/débito, PSE, Nequi, Daviplata y transferencias bancarias.
                            Todas las transacciones son seguras y procesadas a través de pasarelas de pago certificadas.
                        </p>
                    </AccordionTab>
                </>
            </Accordion>
        </div>
    );
}