// "use client";

// import Header from "@/components/Header";
// import { rudrakshas } from "@/constant/constant";
// import { useCart } from "@/context/CardContext";
// import Image from "next/image";

// const Rudraksha = () => {
//   const { addToCart } = useCart();
//   return (
//     <div>
//       <Header status={true} />
//       <div className="w-screen flex mt-16 flex-col md:flex-row gap-5 justify-center items-center">
//         <div className="w-full py-5 bg-gradient-to-r px-5 from-[#314867] via-[#314867] to-black md:mt-0 h-full relative flex flex-col-reverse md:flex-row justify-center items-center gap-5 md:gap-0">
//           <div className="flex-1 flex flex-col md:items-start items-center px-5 md:px-8">
//             <h2 className="text-[22px] text-center md:text-start md:text-[36px] leading-[1.2] text-[#F5FF00] font-bold capitalize">
//               RUDRAKSHA: <br /> SHIVA’S SACRED SEED OF DIVINE TRANSFORMATION
//             </h2>
//             <div className="w-[100%] md:w-[60%] h-0.5 my-4 bg-white"></div>
//             <p className="text-white text-[20px] leading-[1.5] text-center md:text-start font-normal">
//               Spiritual Armor to Dissolve Karma, Heal Body &{" "}
//               <br className="hidden md:block" /> Mind, and Connect With the
//               Divine
//             </p>
//             <button className="mt-6 bg-[#F5FF00] hover:bg-[#e6e600] text-[#314867] font-bold py-2 px-6 rounded-xl transition-colors duration-300">
//               Buy Now
//             </button>
//           </div>
//           <div className="w-[80%] md:w-[30%] aspect-square relative">
//             <Image
//               src={`/images/remedies/rudraksha-hero.jpg`}
//               alt="Rudraksha Hero"
//               fill
//               className="object-cover"
//             />
//           </div>
//         </div>
//       </div>
//       <div className="w-full flex flex-col py-8 gap-5">
//         <h3 className="text-center text-[24px] md:text-[30px] font-semibold text-[#02030B]">
//           Rudraksha: Sacred Seeds of Shiva’s Grace, Protection & Liberation
//         </h3>
//         <p className="text-[16px] md:text-[18px] leading-[1.6] text-[#02030B] font-normal px-5 md:px-16">
//           Rudraksha beads are not mere seeds—they are living conduits of Shiva’s
//           grace, pulsating with his compassionate energy. According to sacred
//           texts like the Shiva Purana, Padma Purana, and Devi Bhagavatam, these
//           seeds were born from the tears of Shiva when he beheld the suffering
//           of humanity.
//         </p>
//         <p className="text-[16px] mt-2 md:text-[18px] leading-[1.6] text-[#02030B] font-normal px-5 md:px-16">
//           The Sanskrit term Rudraksha is a fusion of two words: Rudra (Shiva)
//           and Aksha (Eye/Tear). They are said to embody the vision and
//           compassion of the Supreme Dissolution Archetype, who destroys
//           illusion, sorrow, negative energy, and falsehoods, and grants
//           liberation.
//         </p>
//         <p className="text-[16px] mt-2 md:text-[18px] leading-[1.6] text-[#02030B] font-normal px-5 md:px-16">
//           When worn with reverence, Rudraksha beads serve as your personal
//           spiritual shield, karmic cleanser, mental harmonizer, and Divine
//           connector. Across ages, saints, sages, and seekers have turned to
//           Rudraksha for its divine intelligence— to rise above fear, align with
//           righteousness, and access the power to manifest change and progress.
//         </p>
//         <h3 className="text-center text-[22px] md:text-[28px] font-normal text-[#02030B]">
//           Scriptural Significance, Inner Workings & Sacred Powers Of The
//           Rudraksha
//         </h3>
//         <div className="mx-auto px-8 py-5 rounded-xl shadow-xl">
//           <p className="font-semibold">
//             “A person who wears Rudraksha becomes Me. Thus, one should attempt
//             from all levels to wear the Divine Rudraksha.” – Shiva in Padma
//             Purana
//           </p>
//         </div>
//       </div>

//       <div className="bg-gray-100 px-5 py-8">
//         <div className="max-w-7xl mx-auto">
//           <h3 className="text-center text-[24px] md:text-[30px] font-semibold text-[#02030B] mb-5">
//             RUDRAKSHA PACKAGES
//           </h3>
//           <p className="text-[16px] md:text-[18px] text-center leading-[1.6] text-[#02030B] font-normal">
//             You can now purchase our authentic Rudraksha beads online, which
//             have been carefully selected for their purity, ensuring maximum
//             benefits for the wearer’s life to help enhance energy, balance life,
//             and deepen the connection with Divine power.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//             {rudrakshas.map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center"
//               >
//                 <div className="w-32 h-32 relative mb-4">
//                   <Image
//                     src={"/images/remedies/rem1.jpg"}
//                     fill
//                     className="object-cover rounded-full"
//                     alt={item.title}
//                   />
//                 </div>
//                 <h4 className="text-[20px] font-semibold text-[#02030B] mb-2">
//                   Rudraksha - {item.faces} Faces
//                 </h4>
//                 <h5 className="text-[13px] font-bold text-black">
//                   ₹ {item.price}
//                 </h5>
//                 <p className="text-[16px] text-center text-[#02030B] font-normal mb-4">
//                   {item.description}
//                 </p>
//                 <div className="flex w-full justify-around items-center">
//                   <button className="bg-[#314867] hover:bg-[#253746] text-white font-bold py-2 px-4 rounded-xl transition-colors duration-300">
//                     Buy Now
//                   </button>
//                   <button
//                     className="bg-[#6F8BEF] hover:bg-[#5D74E4] text-white font-bold py-2 px-4 rounded-xl transition-colors duration-300"
//                     onClick={() =>
//                       addToCart({
//                         id: index,
//                         faces: item.faces,
//                         price: item.price,
//                         title: `Rudraksha - ${item.faces} Faces`,
//                         image: "/images/remedies/rem1.jpg",
//                         quantity: 1,
//                       })
//                     }
//                   >
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className="w-full flex flex-col py-8 gap-5 bg-[#274161]">
//         <h3 className="text-center text-[24px] md:text-[30px] font-semibold text-white">
//           Mythological Origin: Shiva’s Tears That Became Healers
//         </h3>
//         <div className="mx-auto px-8 py-5 rounded-xl shadow-xl max-w-7xl text-lg bg-white text-black">
//           <p>
//             As per the Shiva Purana, when Shiva completed intense penance and
//             opened his eyes out of deep compassion, tears rolled down his cheeks
//             and fell upon the Earth. These Divine tears sprouted into trees
//             whose fruit—the Rudraksha—became sacred beads of spiritual power.
//             These are not mere seeds, but vibrational entities, blessed directly
//             by Mahadev to dissolve human suffering.
//           </p>
//           <p className="mt-2">
//             The Devi Bhagavatam reveres Rudraksha as a celestial remedy
//             specifically gifted for Kali Yuga—where it becomes a protective
//             armor against delusion and karmic pitfalls. It is said that even
//             seeing or touching a Rudraksha can destroy negative karma and
//             cleanse the soul of sins committed across lifetimes.
//           </p>
//         </div>
//         <h3 className="text-center text-[24px] md:text-[30px] font-semibold text-white">
//           How Rudraksha Works: A Bio-Spiritual Conduit
//         </h3>
//         <div className="mx-auto px-8 py-5 rounded-xl shadow-xl max-w-7xl text-lg bg-white text-black">
//           <p>
//             Scientific validation now echoes ancient wisdom— Rudraksha beads
//             emit subtle electrical impulses and possess dielectric, magnetic,
//             and inductive properties that influence our bio-energetic field.
//             They regulate the heartbeat, brainwaves, and nerve currents, acting
//             as a spiritual stabilizer.
//           </p>
//           <p className="mt-2">
//             Worn against the skin, Rudraksha resonates with the human body’s
//             natural frequency, synchronizing biorhythms and calming the
//             autonomic nervous system. It balances the left and right hemispheres
//             of the brain, harmonizes hormonal output, and neutralizes
//             environmental stress.
//           </p>
//           <p className="mt-2">
//             Each Mukhi (Face) acts like a cosmic receptor, tuning into specific
//             planetary and divine frequencies. When matched to one’s Nakshatra
//             (Birth Star) or Doshic imbalances (Energy Defects Due to
//             Mal-alignment of Planets), it becomes a personal talisman,
//             correcting energy distortions and unlocking higher consciousness.
//           </p>
//           <p className="mt-2">
//             Rudraksha is not passive—it acts through the Chakras (Energy
//             Centers). Placed over the Anahata (Heart Chakra), it fosters
//             compassion and love; over the Ajna (Third Eye), it deepens intuition
//             and meditation; and through Japa, it amplifies mantras by grounding
//             the mind and stabilizing thought.
//           </p>
//           <p className="mt-2">
//             The Shiva Purana affirms: “He who wears Rudraksha is always pure and
//             becomes equal to Me.” Hence, Wearing Rudraksha is a spiritual
//             technology engineered by the cosmos and brings the power of Divine
//             energy into daily life, helping you face the future with courage,
//             clarity, and calm.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Rudraksha;
