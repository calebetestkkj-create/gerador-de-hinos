
import { HymnData } from '../types';

export const HYMN_DATABASE: HymnData[] = [
  {
    id: 'hymn-1',
    number: 1,
    title: "Ó Deus de Amor",
    keySignature: "F",
    timeSignature: "4/4",
    suggestedTempo: 90,
    scriptureReference: "Salmos 100:5",
    sections: [
      { type: "Estrofe 1", lyrics: "[F]Ó Deus de amor, [Dm]vimos nós [Gm]Te a[C]dorar,\n[F]Vimos Teu nome [Bb]e[C]xal[F]tar.\n[F]Dá-nos o pão, [Dm]Tua gra[Gm]ça e [C]luz,\n[F]Em nome de [Bb]Cris[C]to [F]Jesus." },
      { type: "Estrofe 2", lyrics: "[F]Eterno Pai, [Dm]Teu po[Gm]vo a[C]qui,\n[F]Vem consagrar-se [Bb]tu[C]do a [F]Ti.\n[F]Vem conceder [Dm]bênçãos [Gm]lá dos [C]céus,\n[F]Ó justo e e[Bb]ter[C]no [F]Deus." }
    ],
    category: "Adoração"
  },
  {
    id: 'hymn-10',
    number: 10,
    title: "Louvamos-Te, ó Deus",
    keySignature: "G",
    timeSignature: "3/4",
    suggestedTempo: 100,
    scriptureReference: "Salmos 145:1",
    sections: [
      { type: "Estrofe 1", lyrics: "[G]Louvamos-Te, ó [D]Deus, pelo [C]dom de Je[G]sus,\n[G]Que por nós, peca[D]dores, mo[C]rreu [D]na [G]cruz." },
      { type: "Coro", lyrics: "[G]Aleluia! Toda a [Em]glória,\n[Am]Ale[D]luia! [G]Amém!\n[G]Aleluia! Toda a [Em]glória\n[C]A [D]Deus [G]convém." }
    ],
    category: "Louvor"
  },
  {
    id: 'hymn-33',
    number: 33,
    title: "Com a Minha Voz Clamo a Deus",
    keySignature: "E",
    timeSignature: "4/4",
    suggestedTempo: 75,
    scriptureReference: "Salmos 77",
    sections: [
      { type: "Estrofe 1", lyrics: "[E]Com a minha voz clamo a [B]Deus;\n[A]Clamo a [B]Deus e Ele me ouvi[E]rá.\n[E]No dia da angústia busco ao [B]Senhor;\n[A]De noite a minha [B]mão se estende[E]rá." },
      { type: "Coro", lyrics: "[E]Tu és o Deus que [A]fazes ma[B]ravilhas;\n[A]Tu és o [B]Deus que fazes mara[E]vilhas." }
    ],
    category: "Súplica"
  },
  {
    id: 'hymn-205',
    number: 205,
    title: "Vencendo Vem Jesus",
    keySignature: "Bb",
    timeSignature: "4/4",
    suggestedTempo: 105,
    scriptureReference: "Apocalipse 1:7",
    sections: [
      { type: "Estrofe 1", lyrics: "[Bb]Já refulge a glória eterna de Je[Eb]sus, o Rei dos [Bb]reis;\nBreve os reinos deste mundo [F]seguirão as Suas [Bb]leis!\nOs sinais da Sua volta mais se [Eb]mostram cada [Bb]vez:\nVen[Cm]cen[F]do [Bb]vem Jesus!" },
      { type: "Coro", lyrics: "[Bb]Glória, glória! Aleluia!\n[Eb]Glória, glória! Ale[Bb]luia!\n[Bb]Glória, glória! Aleluia!\nVen[Cm]cen[F]do [Bb]vem Jesus!" }
    ],
    category: "Segunda Vinda"
  },
  {
    id: 'hymn-422',
    number: 422,
    title: "Noite de Paz",
    keySignature: "C",
    timeSignature: "3/4",
    suggestedTempo: 80,
    scriptureReference: "Lucas 2:14",
    sections: [
      { type: "Estrofe 1", lyrics: "[C]Tudo é paz! Tudo amor!\n[G]Dormem todos [C]em redor.\n[F]Em Belém Jesus [C]nasceu,\n[F]Rei da paz, da terra e [C]céu;\n[G]Nosso Salva[C]dor... [G]é Je[C]sus Senhor." }
    ],
    category: "Natal"
  }
];
