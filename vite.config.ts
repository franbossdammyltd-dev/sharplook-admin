// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import { viteStaticCopy } from "vite-plugin-static-copy";

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     viteStaticCopy({
//       targets: [
//         {
//           src: "public/_redirects", 
//           dest: ".",                
//         },
//       ],
//     }),
//   ],
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects",
          dest: ".",
        },
      ],
    }),
  ],



  // preview: {
  //   host: "0.0.0.0",
  //   port: Number(process.env.PORT) || 10000, // ✅ safe and clean
  //   allowedHosts: [
  //     "sharplook-admin-1zea.onrender.com",
  //     "localhost",
  //   ],
  // },


preview: {
  host: "0.0.0.0",
  port: Number(process.env.PORT) || 10000,
  allowedHosts: ["*"], // ✅ allow all hosts
},

});
