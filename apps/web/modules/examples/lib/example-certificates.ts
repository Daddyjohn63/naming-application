import type { CeremonyCertificateData } from "@/modules/ceremony/ui/components/ceremony-certificate-document"

export type ExampleCertificate = CeremonyCertificateData & {
  id: string
}

/** Six sample finished certificates for the public Examples gallery. */
export const EXAMPLE_CERTIFICATES: readonly ExampleCertificate[] = [
  {
    id: "marmalade",
    everydayName: "Marmalade",
    catWorldName: "Quince of the Warm Windowsill",
    ineffableName: "Mrrr-ah-leh",
    everydayNameRationale:
      "Bright as breakfast toast — a name that sticks to the ribs of the household.",
    catWorldNameRationale:
      "Holds court over the sunniest patch of glass from dawn until the kettle sings.",
    ineffableNameRationale:
      "A soft roll of sound only Marmalade answers to, and only when she chooses.",
    summaryText:
      "A ginger philosopher who treats every cardboard box as a throne and every ankle as a gentle reminder that the world exists for her amusement.\n\nShe is affectionate on her own schedule — a lap appears, she arrives; you call, she considers. Equal parts comedian and tiny aristocrat, she leaves a trail of knocked pens and hard-won trust.",
    photoSrc: "/images/examples/marmalade.jpg",
    dateLabel: "Named on 12 March 2026",
  },
  {
    id: "soot",
    everydayName: "Soot",
    catWorldName: "Ashwalker of the Midnight Stair",
    ineffableName: "Shh-oo-tahn",
    everydayNameRationale:
      "Named for the soft charcoal of his coat and the way he vanishes into shadows.",
    catWorldNameRationale:
      "Patrols the stairs after dark, a silent courier between upstairs and downstairs worlds.",
    ineffableNameRationale:
      "A hush with a vowel inside — the sound of a cat becoming part of the night.",
    summaryText:
      "A sleek black sentinel who prefers the high ground: bookcases, fridge tops, and the shoulders of anyone foolish enough to sit still.\n\nCurious without being careless, he investigates every parcel and judges every guest. When he finally settles against your side, it feels like a promotion.",
    photoSrc: "/images/examples/soot.jpg",
    dateLabel: "Named on 3 January 2026",
  },
  {
    id: "pearl",
    everydayName: "Pearl",
    catWorldName: "Lumen of the Quiet Conservatory",
    ineffableName: "Purr-ellia",
    everydayNameRationale:
      "Pale and luminous — a small treasure that somehow runs the whole house.",
    catWorldNameRationale:
      "Collects sunbeams among the plants and bestows them as if they were gifts.",
    ineffableNameRationale:
      "A name that purrs itself — half murmur, half melody, entirely hers.",
    summaryText:
      "A cream-coated companion with watchful eyes and a talent for appearing exactly where the light is best.\n\nGentle with those she trusts, theatrical with her tail, and quietly opinionated about which cushion is hers. She is the still point in a busy home — until a moth appears.",
    photoSrc: "/images/examples/pearl.jpg",
    dateLabel: "Named on 28 April 2026",
  },
  {
    id: "pepper",
    everydayName: "Pepper",
    catWorldName: "Pip of the Clattering Banister",
    ineffableName: "Peh-prr",
    everydayNameRationale:
      "A sharp little spark — seasoning for every ordinary day.",
    catWorldNameRationale:
      "Known across the hallway for bold descents and even bolder landings.",
    ineffableNameRationale:
      "A clipped, peppery syllable that means both come here and don't you dare.",
    summaryText:
      "A brindled whirlwind who turns doorways into racetracks and paper bags into destinations.\n\nPepper is mischief with whiskers: affectionate mid-chase, apologetic mid-knockover, and somehow always forgiven. The household runs on her schedule — they just pretend otherwise.",
    photoSrc: "/images/examples/pepper.jpg",
    dateLabel: "Named on 19 February 2026",
  },
  {
    id: "clover",
    everydayName: "Clover",
    catWorldName: "Mossqueen of the Garden Gate",
    ineffableName: "Klo-veh-ryn",
    everydayNameRationale:
      "Lucky, green-eyed, and forever half in the outdoor world.",
    catWorldNameRationale:
      "Rules the threshold between kitchen and garden with leafy dignity.",
    ineffableNameRationale:
      "A name like wind through hedges — soft consonants, a secret vowel.",
    summaryText:
      "A soft-coated explorer who brings the outdoors in: leaf fragments, grass seeds, and an air of having Important Business in the flowerbeds.\n\nAffectionate after adventures, she will narrate the day in chirps if you listen. Independent enough to vanish for an hour; loyal enough to check you are still waiting.",
    photoSrc: "/images/examples/clover.jpg",
    dateLabel: "Named on 7 May 2026",
  },
  {
    id: "ink",
    everydayName: "Ink",
    catWorldName: "Vellum of the Lamp-Lit Desk",
    ineffableName: "Ihm-keh",
    everydayNameRationale:
      "Dark as a fresh page of night — and just as hard to put down.",
    catWorldNameRationale:
      "Claims the desk as a library annex and the keyboard as a heated bed.",
    ineffableNameRationale:
      "A low ink-drop of a name, spoken mostly in the dark when the house is quiet.",
    summaryText:
      "A velvet-black scholar of laps and laptop lids, equally content to supervise emails or ignore them entirely.\n\nInk is dignified until a feather toy appears, then briefly ungovernable. Afterwards he returns to the desk as if nothing happened — and expects you to do the same.",
    photoSrc: "/images/examples/ink.jpg",
    dateLabel: "Named on 22 June 2026",
  },
] as const
