export const TZ = 'America/Mexico_City';
export function mexicoDate(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit' }).format(now); }
export function noon(date) { return new Date(`${date}T12:00:00-06:00`); }
const mysteries = {
 Gozosos: ['La Anunciación','La Visitación','El nacimiento de Jesús','La presentación de Jesús en el Templo','El hallazgo de Jesús en el Templo'],
 Dolorosos: ['La oración de Jesús en el Huerto','La flagelación de Jesús','La coronación de espinas','Jesús con la cruz a cuestas','La crucifixión y muerte de Jesús'],
 Gloriosos: ['La Resurrección','La Ascensión','La venida del Espíritu Santo','La Asunción de María','La coronación de María'],
 Luminosos: ['El bautismo de Jesús en el Jordán','Las bodas de Caná','El anuncio del Reino de Dios','La Transfiguración','La institución de la Eucaristía']
};
export function mysteryDay(date) { const day = new Date(`${date}T12:00:00-06:00`).getUTCDay(); const name = ['Gloriosos','Gozosos','Dolorosos','Gloriosos','Luminosos','Dolorosos','Gozosos'][day]; return {name, mysteries: mysteries[name]}; }
const prayers = {
 padre: ['Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo.', 'Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.'],
 ave: ['Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús.', 'Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.'],
 gloria: ['Gloria al Padre, y al Hijo, y al Espíritu Santo.', 'Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.']
};
export function rosary(date) {
 const steps = []; const add = (label, lead, response, extra={}) => steps.push({index:steps.length,label,lead,response,...extra});
 const p = (kind,label,extra) => add(label,...prayers[kind],extra);
 add('Señal de la cruz','En el nombre del Padre, y del Hijo, y del Espíritu Santo.','Amén.');
 add('Credo de los Apóstoles','Profesemos nuestra fe.', 'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.');
 p('padre','Padrenuestro inicial');
 for(let i=1;i<=3;i++) p('ave',`Avemaría inicial ${i} de 3`);
 p('gloria','Gloria inicial');
 mysteryDay(date).mysteries.forEach((m,i) => { const extra={mystery:i+1,mysteryTitle:m}; p('padre',`${i+1}. ${m} · Padrenuestro`,extra); for(let j=1;j<=10;j++) p('ave',`Avemaría ${j} de 10`,{...extra,bead:j}); p('gloria','Gloria',extra); add('Oración de Fátima','Oh Jesús mío,', 'perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia.',extra); });
 add('Salve','Dios te salve, Reina y Madre de misericordia.', 'Vida, dulzura y esperanza nuestra, Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María!');
 add('Ruega por nosotros','Ruega por nosotros, Santa Madre de Dios.', 'Para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.');
 add('Oración final','Oremos.', 'Oh Dios, cuyo Hijo unigénito, con su vida, muerte y resurrección, nos ha alcanzado el premio de la vida eterna: concédenos que, meditando estos misterios del Santísimo Rosario de la Virgen María, imitemos lo que contienen y alcancemos lo que prometen. Por Jesucristo nuestro Señor. Amén.');
 add('Bendición final','En el nombre del Padre, y del Hijo, y del Espíritu Santo.','Amén.');
 return steps;
}
export function normalize(text) { return text.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,''); }
