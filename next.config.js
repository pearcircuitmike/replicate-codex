/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

// load the URL map from urlMap.json
const urlMap = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./urlMap.json"), "utf-8")
);

const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    // existing redirects
    const existingRedirects = [
      {
        source: "/models/:id(\\d{3})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/models/:id(\\d{2})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/models/:id(\\d{1})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/creators/:id",
        destination: "/creators/replicate/:id",
        permanent: true,
      },
    ];

    // new redirects based on urlMap
    const newRedirects = urlMap.map((mapping) => ({
      source: `/models/replicate/${mapping.old_id}`, // construct source URL with old_id
      destination: `/models/replicate/${mapping.id}`,
      permanent: true,
    }));

    const rearchitectureRedirects = [
      {
        source: "/models/replicate/f3e540cd-400b-4594-b11b-280f45a62722",
        destination: "/models/replicate/codeformer-sczhou",
        permanent: true,
      },
      {
        source: "/models/replicate/9f6ef41e-72f5-4d11-bbb2-ba587b4228c2",
        destination: "/models/replicate/nafnet-megvii-research",
        permanent: true,
      },
      {
        source: "/models/replicate/464b2ad6-3063-4c5e-a31b-ef167547c5df",
        destination: "/models/replicate/gfpgan-tencentarc",
        permanent: true,
      },
      {
        source: "/models/replicate/78874a62-254d-48a1-b4aa-ef6a26ea7651",
        destination: "/models/replicate/real-esrgan-nightmareai",
        permanent: true,
      },
      {
        source: "/models/replicate/dbf129a9-aebc-488c-ba59-a3c4fb0cd815",
        destination: "/models/replicate/gfpgan-xinntao",
        permanent: true,
      },
      {
        source: "/models/replicate/ed15951e-39b1-46ba-b624-d4807e5e7ce6",
        destination: "/models/replicate/zoedepth-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/dc281720-bf65-4cff-b3d7-327506e16128",
        destination: "/models/replicate/latent-sr-nightmareai",
        permanent: true,
      },
      {
        source: "/models/replicate/433a757c-9bd7-4763-a508-912a891f2e8c",
        destination:
          "/models/replicate/controlnet-1.1-x-realistic-vision-v2.0-usamaehsan",
        permanent: true,
      },
      {
        source: "/models/replicate/b1d233a2-0aad-4bf6-8ec9-b3741d4edba8",
        destination: "/models/replicate/realesrgan-xinntao",
        permanent: true,
      },
      {
        source: "/models/replicate/d04339ab-8742-4bfc-a2ce-af7774ced583",
        destination: "/models/replicate/controlnet-hough-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/e7c94c99-cd01-4c6a-afab-299f562bd17b",
        destination: "/models/replicate/ad-inpaint-logerzhu",
        permanent: true,
      },
      {
        source: "/models/replicate/cc02f1ea-2623-4635-8123-1c908710c8f6",
        destination: "/models/replicate/funko-diffusion-prompthero",
        permanent: true,
      },
      {
        source: "/models/replicate/fc984c25-b839-470b-bb14-e483ac0b9eaf",
        destination: "/models/replicate/real-esrgan-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/b2fc1e13-d257-4202-bd53-71a46e5c22fb",
        destination: "/models/replicate/anything-v3-better-vae-cjwbw",
        permanent: true,
      },
      {
        source: "/models/huggingFace/85fa0974-cb35-4935-acda-685ed8ceb3ef",
        destination: "/models/huggingFace/vicuna-33b-v1.3-lmsys",
        permanent: true,
      },
      {
        source: "/models/replicate/5aae90af-46e6-47ab-a8ec-923a0b93fc16",
        destination: "/models/replicate/rembg-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/116fc9f0-04dd-4f4c-8868-ca5daf346da4",
        destination:
          "/models/replicate/sd_pixelart_spritesheet_generator-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/b2af3925-23d1-4c16-a925-2138896cfefe",
        destination: "/models/replicate/cogvideo-nightmareai",
        permanent: true,
      },
      {
        source: "/models/replicate/d8b2432a-6f94-445b-a921-ac3de7d66012",
        destination: "/models/replicate/nsfw-filter-m1guelpf",
        permanent: true,
      },
      {
        source: "/models/replicate/1b9105e7-0ba6-43c2-bc76-46f185c52874",
        destination: "/models/replicate/stable-diffusion-dance-pollinations",
        permanent: true,
      },
      {
        source: "/models/replicate/b47e8fec-fd89-4960-b8f1-d14ca46f1e61",
        destination:
          "/models/replicate/bringing-old-photos-back-to-life-microsoft",
        permanent: true,
      },
      {
        source: "/models/replicate/813e09a8-4e3b-47df-a7b3-8dddeba3bb77",
        destination: "/models/replicate/clip-vit-large-patch14-cjwbw",
        permanent: true,
      },
      {
        source: "/models/huggingFace/f470ef0f-8a2f-4835-afb4-e344f8071c9a",
        destination:
          "/models/huggingFace/wav2vec2-large-xlsr-53-english-jonatasgrosman",
        permanent: true,
      },
      {
        source: "/models/replicate/914967a2-2eea-431e-b469-9942f00debcb",
        destination: "/models/replicate/swinir-jingyunliang",
        permanent: true,
      },
      {
        source: "/models/replicate/4449f137-6a3e-4d94-82c2-0ac5d56ae3df",
        destination: "/models/replicate/kandinsky-2.2-ai-forever",
        permanent: true,
      },
      {
        source: "/models/replicate/ad8415bb-70e2-4de9-9ea7-71445f8850bf",
        destination: "/models/replicate/swin2sr-mv-lab",
        permanent: true,
      },
      {
        source: "/models/replicate/48b1fc5b-ec5a-4112-90cc-6eb0ce0ffc78",
        destination: "/models/replicate/cog-wav2lip-devxpy",
        permanent: true,
      },
      {
        source: "/models/replicate/a071411b-f020-4ec5-9442-d551d32350af",
        destination:
          "/models/replicate/zero_shot_audio_source_separation-retrocirce",
        permanent: true,
      },
      {
        source: "/models/replicate/29ea33fd-20ee-4bf8-80ef-4b5f474d35d1",
        destination: "/models/replicate/tortoise-tts-afiaka87",
        permanent: true,
      },
      {
        source: "/models/replicate/4992d576-9e9f-426f-848b-23aee42796ea",
        destination: "/models/replicate/thin-plate-spline-motion-model-yoyo-nb",
        permanent: true,
      },
      {
        source: "/models/replicate/201bd7f1-3956-484f-9090-9b4896661750",
        destination: "/models/replicate/openhermes-2-mistral-7b-antoinelyset",
        permanent: true,
      },
      {
        source: "/models/replicate/545dd78d-38c3-4eaf-97e7-55e963c2595b",
        destination:
          "/models/replicate/stable-diffusion-image-variation-lambdal",
        permanent: true,
      },
      {
        source: "/models/replicate/45fc2946-f1b4-4481-8c66-b91a9e383fd5",
        destination: "/models/replicate/free-vc-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/113f04ca-c248-44c7-ae7a-955508f048d6",
        destination: "/models/replicate/effnet-discogs-mtg",
        permanent: true,
      },
      {
        source: "/models/replicate/e7a3b40f-753b-441f-ba76-05c0bb605403",
        destination: "/models/replicate/deforum-stable-diffusion-deforum-art",
        permanent: true,
      },
      {
        source: "/models/replicate/f9ca9660-31b6-4928-9132-44c4eb41c20a",
        destination: "/models/replicate/material-diffusion-tstramer",
        permanent: true,
      },
      {
        source: "/models/replicate/0f88f0ca-25e7-4eff-ab3d-f553a2a20605",
        destination: "/models/replicate/clip-interrogator-pharmapsychotic",
        permanent: true,
      },
      {
        source: "/models/replicate/8d1b8cdd-3c8b-4490-b709-dd9af9963b2b",
        destination: "/models/replicate/anything-v4.0-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/458ff7c3-71e0-4107-a4d0-5f0d671ec887",
        destination: "/models/replicate/img2prompt-methexis-inc",
        permanent: true,
      },
      {
        source: "/models/replicate/c5378217-475c-4aef-aaff-6be9f3e0d0fe",
        destination: "/models/replicate/maxim-google-research",
        permanent: true,
      },
      {
        source: "/models/replicate/41f31acf-5a98-4b7e-bfa1-0002a3159817",
        destination: "/models/replicate/pony-diffusion-tstramer",
        permanent: true,
      },
      {
        source: "/models/replicate/84b46321-d92b-4b08-9baf-34018a406a40",
        destination: "/models/replicate/text-to-pokemon-lambdal",
        permanent: true,
      },
      {
        source: "/models/replicate/be068a3d-7f8c-4902-8920-66218ea094d8",
        destination:
          "/models/replicate/stable-diffusion-inpainting-stability-ai",
        permanent: true,
      },
      {
        source: "/models/replicate/c16ba188-2138-40bd-9544-5313f41feb91",
        destination: "/models/replicate/scunet-cszn",
        permanent: true,
      },
      {
        source: "/models/replicate/29586dc4-b0a5-4e98-bc25-59b7a3781c91",
        destination: "/models/replicate/real-esrgan-a100-daanelson",
        permanent: true,
      },
      {
        source: "/models/huggingFace/adb830c7-b809-41ab-a874-cb8762e59c52",
        destination: "/models/huggingFace/whisper-hindi-small-vasista22",
        permanent: true,
      },
      {
        source: "/models/replicate/691b3ad1-255d-4e26-a5c7-ee203c13259b",
        destination: "/models/replicate/deep-image-diffusion-prior-laion-ai",
        permanent: true,
      },
      {
        source: "/models/replicate/2d329301-20f0-4013-900e-76de96cd8396",
        destination: "/models/replicate/controlnet-seg-jagilley",
        permanent: true,
      },
      {
        source: "/models/huggingFace/ecc25f9f-579b-4b8b-96d1-504f747f673c",
        destination: "/models/huggingFace/gtr-t5-large-sentence-transformers",
        permanent: true,
      },
      {
        source: "/models/replicate/2e9f6d8f-aff6-42c6-8eff-063a60633f5a",
        destination: "/models/replicate/bigcolor-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/2d200a2f-cfe7-41fe-b719-424b5d4cfa02",
        destination: "/models/replicate/bark-suno-ai",
        permanent: true,
      },
      {
        source: "/models/huggingFace/b80b4e62-8dcb-4048-adba-2766586a0475",
        destination:
          "/models/huggingFace/tiny-random-llamaforcausallm-huggingfaceh4",
        permanent: true,
      },
      {
        source: "/models/replicate/f41910f5-74b8-4ba3-8154-bf8c60ff71f4",
        destination: "/models/replicate/controlnet-scribble-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/a17940d4-52a9-4302-9c5a-e2d72f11521e",
        destination: "/models/replicate/dance-diffusion-harmonai",
        permanent: true,
      },
      {
        source: "/models/huggingFace/afe8a102-4fd6-4b68-b884-be0df2b434b4",
        destination: "/models/huggingFace/kotosmix-holynoobyai",
        permanent: true,
      },
      {
        source: "/models/replicate/8cfb5b1c-ef3c-4baa-81ca-f103cf8956e9",
        destination: "/models/replicate/pix2struct-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/5f9da176-d72d-4e39-9640-a217ac9b3bb2",
        destination: "/models/replicate/emoji-diffusion-m1guelpf",
        permanent: true,
      },
      {
        source: "/models/replicate/adcdc78d-a218-4613-80a0-125bd2734549",
        destination: "/models/replicate/babes-v2.0-mcai",
        permanent: true,
      },
      {
        source: "/models/replicate/60029bed-dd1b-4305-b82f-0b491699996a",
        destination: "/models/replicate/dreamshaper-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/3533c987-56c6-4e89-b273-ec379f1ac850",
        destination: "/models/replicate/diffae-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/ca9d1a4c-6885-461b-9851-48d422fbdea7",
        destination: "/models/replicate/detic-facebookresearch",
        permanent: true,
      },
      {
        source: "/models/replicate/77e8208f-dc8c-4c3f-bc3f-aeae7bb73912",
        destination: "/models/replicate/gpen-yangxy",
        permanent: true,
      },
      {
        source: "/models/huggingFace/e905bb8a-83a9-41aa-a5a2-4b8da60138e5",
        destination: "/models/huggingFace/biolinkbert-base-michiyasunaga",
        permanent: true,
      },
      {
        source: "/models/replicate/1e6ead89-b3be-4dee-a38a-530febe96d68",
        destination: "/models/replicate/stable-diffusion-img2img-stability-ai",
        permanent: true,
      },
      {
        source: "/models/huggingFace/bc51a08f-a296-4bb4-82c1-9aca6ea8c8f2",
        destination:
          "/models/huggingFace/clip-vit-b-16-laion2b-s34b-b88k-laion",
        permanent: true,
      },
      {
        source: "/models/replicate/d9b51cd1-db11-4c1e-a456-ec61156262e3",
        destination: "/models/replicate/distilgpt2-stable-diffusion-v2-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/cdd1e71d-83f3-4614-a7b9-feeac5a0ab17",
        destination: "/models/replicate/pastel-mix-cjwbw",
        permanent: true,
      },
      {
        source: "/models/huggingFace/896e3d1a-6800-4b5e-924d-83a85d63c4e2",
        destination: "/models/huggingFace/vicuna-13b-v1.3-lmsys",
        permanent: true,
      },
      {
        source: "/models/replicate/3408fb7c-2660-4ab8-a8ae-71857cf265c3",
        destination: "/models/replicate/sd-x2-latent-upscaler-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/5d4d76d8-a7dd-4e67-8be5-4be884ed47a4",
        destination: "/models/replicate/majesty-diffusion-nightmareai",
        permanent: true,
      },
      {
        source: "/models/replicate/3d202c0a-60d9-47bc-8905-998f44bd1018",
        destination: "/models/replicate/lora-advanced-training-cloneofsimo",
        permanent: true,
      },
      {
        source: "/models/replicate/1cc2210a-8252-4b79-a596-28043647b9ce",
        destination: "/models/replicate/segment-anything-automatic-pablodawson",
        permanent: true,
      },
      {
        source: "/models/replicate/a5df56c3-95d6-4fbd-9cf7-5a708376f271",
        destination: "/models/replicate/airoboros-llama-2-70b-uwulewd",
        permanent: true,
      },
      {
        source: "/models/replicate/0910930f-7ce1-4357-80e6-524547162324",
        destination: "/models/replicate/3d-photo-inpainting-pollinations",
        permanent: true,
      },
      {
        source: "/models/replicate/74fe6755-fc4d-47ce-86b4-776eb14051e5",
        destination: "/models/replicate/ifan-defocus-deblur-codeslake",
        permanent: true,
      },
      {
        source: "/models/replicate/55a4cac8-f6cb-4664-8996-fbe52fbf1b81",
        destination: "/models/replicate/music-inpainting-bert-andreasjansson",
        permanent: true,
      },
      {
        source: "/models/replicate/df58cad3-1e8a-4d68-8085-d802e951d589",
        destination: "/models/replicate/blip-2-salesforce",
        permanent: true,
      },
      {
        source: "/models/replicate/76c45118-b219-47de-809c-04a542d4bab1",
        destination: "/models/replicate/modnet-pollinations",
        permanent: true,
      },
      {
        source: "/models/replicate/299bc26e-28c5-4fb9-9191-f4424599fb36",
        destination: "/models/replicate/controlnet-hed-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/797e729f-f6dc-42e9-9024-c3389f1bf890",
        destination: "/models/replicate/controlnet-pose-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/927a196c-7835-4e04-8645-b95ef0bd61bb",
        destination: "/models/replicate/controlnet-normal-jagilley",
        permanent: true,
      },
      {
        source: "/models/replicate/d3f5d4bc-4772-4642-a1f7-4275a8c82005",
        destination: "/models/replicate/audio-ldm-haoheliu",
        permanent: true,
      },
      {
        source: "/models/replicate/80778153-86bc-4456-97e3-4ef919c2481a",
        destination:
          "/models/replicate/segformer-b0-finetuned-ade-512-512-bfirsh",
        permanent: true,
      },
      {
        source: "/models/replicate/9cb12cb5-fb21-4376-bde8-f8184cbf5942",
        destination: "/models/replicate/stylegan3-clip-ouhenio",
        permanent: true,
      },
      {
        source: "/models/replicate/811f8572-da91-4db7-8590-1180a2dd00db",
        destination: "/models/replicate/epicrealism-prompthero",
        permanent: true,
      },
      {
        source: "/models/replicate/8b8db948-eeb8-43d4-acac-8102b6d4a827",
        destination: "/models/replicate/photorealistic-fx-lora-batouresearch",
        permanent: true,
      },
      {
        source: "/models/replicate/2d2b0e97-41a2-407e-aa02-89f0d6f2b37c",
        destination: "/models/replicate/fashion-ai-naklecha",
        permanent: true,
      },
      {
        source: "/models/replicate/b5a387cb-c554-458a-9d4b-ecefde09135b",
        destination: "/models/replicate/herge-style-cjwbw",
        permanent: true,
      },
      {
        source: "/models/replicate/a9476a25-c194-4d73-8a4e-942480170cdd",
        destination: "/models/replicate/julius-ml6",
        permanent: true,
      },
      {
        source: "/models/replicate/62b6df08-f646-4830-a67a-18a9906fb9dd",
        destination: "/models/replicate/style-your-hair-cjwbw",
        permanent: true,
      },
      {
        source: "/models/huggingFace/5490d513-f665-4293-8e5b-d72dc7b313e1",
        destination: "/models/huggingFace/roberta-base-huggingface",
        permanent: true,
      },
      {
        source: "/models/replicate/a82778f4-1168-4d34-a699-88ae1f64de3b",
        destination: "/models/replicate/riffusion-riffusion",
        permanent: true,
      },
      {
        source: "/models/deepInfra/57cb9739-0736-4b34-936d-8ffb4697ede7",
        destination: "/models/deepInfra/flan-t5-xxl-google",
        permanent: true,
      },
      {
        source: "/models/huggingFace/72efc056-5005-4fa8-a2bb-b539b91079b9",
        destination: "/models/huggingFace/tts-hifigan-ljspeech-speechbrain",
        permanent: true,
      },
      {
        source: "/models/replicate/dc37711f-40f8-4f5e-9470-9b1f56e0fee0",
        destination: "/models/replicate/blip-salesforce",
        permanent: true,
      },
      {
        source: "/models/huggingFace/39f1414d-ef9e-482f-91cd-a4b68459e12d",
        destination:
          "/models/huggingFace/wizardlm-13b-v1.0-uncensored-gptq-thebloke",
        permanent: true,
      },
      {
        source: "/models/replicate/2f276253-642d-4946-8e2a-efa4b52f848b",
        destination:
          "/models/replicate/real-basicvsr-video-superresolution-pollinations",
        permanent: true,
      },
      {
        source: "/models/replicate/a8fd5e93-ea54-4b93-8b74-1dd3fe31fc13",
        destination: "/models/replicate/classic-anim-diffusion-tstramer",
        permanent: true,
      },
      {
        source: "/models/replicate/007c95d2-f661-440a-b727-22608a264ae3",
        destination:
          "/models/replicate/stable-diffusion-aesthetic-gradients-cjwbw",
        permanent: true,
      },
    ];

    // return the combined list of redirects
    return [...existingRedirects, ...newRedirects, ...rearchitectureRedirects];
  },

  async headers() {
    return [
      {
        source: "/papers/:platform/:paper*",
        headers: [
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
