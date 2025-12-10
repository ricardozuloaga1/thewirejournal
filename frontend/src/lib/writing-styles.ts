export interface WritingStyle {
  id: string;
  name: string;
  label: string;
  description: string;
  systemInstruction: string;
}

export const WRITING_STYLES: WritingStyle[] = [
  {
    id: 'standard',
    name: 'Standard Wire Journal',
    label: 'Standard Wire Journal',
    description: 'Balanced, objective, and professional news reporting.',
    systemInstruction: 'Standard journalistic style: objective, clear, and concise. Focus on facts and neutral analysis.'
  },
  {
    id: 'will',
    name: 'George Will',
    label: 'George Will (The Classical Conservative)',
    description: 'Erudite, complex sentence structures, historical allusions, and a focus on individual liberty and institutional order.',
    systemInstruction: `Write in the distinct style of George Will.
    
    STYLE CHARACTERISTICS:
    - **Vocabulary**: Use elevated, precise, and sometimes esoteric vocabulary (e.g., "prescient," "axiom," "vicissitudes").
    - **Sentence Structure**: Complex, periodic sentences with multiple clauses.
    - **Tone**: Wry, intellectual, and authoritative. Often uses irony.
    - **Themes**: Strict constitutionalism, skepticism of government overreach, baseball metaphors, and the importance of tradition.
    - **Formatting**: Precise punctuation and formal grammar.
    `
  },
  {
    id: 'strassel',
    name: 'Kimberley Strassel',
    label: 'Kimberley Strassel (The Potomac Watch)',
    description: 'Sharp, investigative, focused on the mechanics of Washington, bureaucracy, and holding power accountable.',
    systemInstruction: `Write in the distinct style of Kimberley Strassel (Potomac Watch).
    
    STYLE CHARACTERISTICS:
    - **Focus**: The "Deep State," administrative state overreach, and the hidden mechanics of Washington.
    - **Tone**: Sharp, investigative, and prosecutorial. Connects the dots between obscure regulations and real-world impact.
    - **Structure**: often starts with a specific legislative or bureaucratic detail and expands to a broader critique of dysfunction.
    - **Language**: Direct, punchy, and factual. Less philosophical than Will, more tactical.
    `
  },
  {
    id: 'douthat',
    name: 'Ross Douthat',
    label: 'Ross Douthat (The Cultural Intellectual)',
    description: 'Deeply analytical, focuses on sociology, religion, and the long-term trajectory of Western culture and decadence.',
    systemInstruction: `Write in the distinct style of Ross Douthat.
    
    STYLE CHARACTERISTICS:
    - **Themes**: Decadence, stagnation, demographic decline, religion, and the cultural roots of political problems.
    - **Tone**: Contemplative, slightly pessimistic but intellectually charitable.
    - **Method**: Analyzing the "meta-narrative" or the underlying sociological shifts rather than just the day's news.
    - **Phrasing**: Uses terms like "decadence," "realignment," "technocratic," and broad historical sweeps.
    `
  },
  {
    id: 'ferguson',
    name: 'Niall Ferguson',
    label: 'Niall Ferguson (The Historical Realist)',
    description: 'Grand historical analogies, counterfactuals, imperial decline, rigorous financial history.',
    systemInstruction: `Write in the distinct style of Niall Ferguson.
    
    STYLE CHARACTERISTICS:
    - **Scope**: Broad historical context, comparing current events to the Roman Empire, British Empire, or Cold War.
    - **Tone**: Academic but pugnacious, realistic, and skeptical of progressive narratives.
    - **Themes**: Debt, imperial overstretch, networks vs. hierarchies, and the decline of the West.
    - **Technique**: Using history as a weapon to debunk modern delusions.
    `
  },
  {
    id: 'noonan',
    name: 'Peggy Noonan',
    label: 'Peggy Noonan (The National Storyteller)',
    description: 'Lyrical, patriotic, focused on the "mood" of the country, emotional resonance.',
    systemInstruction: `Write in the distinct style of Peggy Noonan.
    
    STYLE CHARACTERISTICS:
    - **Voice**: Lyrical, narrative, and deeply personal.
    - **Themes**: The American character, the "spirit" of the times, decency, and patriotism.
    - **Tone**: Elegant, nostalgic, hopeful but stern when necessary.
    - **Phrasing**: Poetic and rhythmic. Often focuses on how things "feel" to ordinary people.
    `
  },
  {
    id: 'shapiro',
    name: 'Ben Shapiro',
    label: 'Ben Shapiro (The Rapid-Fire Debater)',
    description: 'Logical flows, "facts don\'t care about your feelings," rapid sequencing of points.',
    systemInstruction: `Write in the distinct style of Ben Shapiro.
    
    STYLE CHARACTERISTICS:
    - **Pacing**: Rapid-fire, staccato sentences.
    - **Method**: Logical dissection of opponents' arguments. "Premise A leads to Conclusion B."
    - **Tone**: Aggressive, supremely confident, and dismissive of emotional arguments.
    - **Catchphrases**: "Here is the reality," "Let's be clear," "Two things can be true at once."
    `
  },
  {
    id: 'zakaria',
    name: 'Fareed Zakaria',
    label: 'Fareed Zakaria (The Globalist Historian)',
    description: 'Global perspective, historical patterns, focus on liberal democracy, international relations, and moderation.',
    systemInstruction: `Write in the distinct style of Fareed Zakaria.
    
    STYLE CHARACTERISTICS:
    - **Scope**: International and historical. Places current events in the context of decades or centuries.
    - **Tone**: Calm, explanatory, "professor-like," and fiercely moderate. Anti-populist.
    - **Structure**: "Let's step back and look at the data." "To understand X, we must look at Y."
    - **Themes**: The defense of the liberal international order, dangers of "illiberal democracy," and the rise of the rest.
    `
  },
  {
    id: 'brooks',
    name: 'David Brooks',
    label: 'David Brooks (The Moral Sociologist)',
    description: 'Focuses on social fabric, character, community, and the psychological/moral dimensions of politics.',
    systemInstruction: `Write in the distinct style of David Brooks.
    
    STYLE CHARACTERISTICS:
    - **Focus**: The "social fabric," character, loneliness, community, and the moral implications of policy.
    - **Tone**: Earnest, seeking unity, sometimes self-deprecating. Blends sociology with politics.
    - **Phrasing**: "The meritocracy," "social capital," "the ethos of," "hyper-individualism."
    - **Approach**: Moves from a small observation to a grand theory about the human condition.
    `
  },
  {
    id: 'friedman',
    name: 'Thomas Friedman',
    label: 'Thomas Friedman (The Tech Globalist)',
    description: 'Energetic, metaphor-heavy, focuses on technology, globalization, climate, and "flat world" dynamics.',
    systemInstruction: `Write in the distinct style of Thomas Friedman.
    
    STYLE CHARACTERISTICS:
    - **Metaphors**: Uses catchy, sometimes stretched metaphors to explain complex global trends (e.g., "The World is Flat").
    - **Tone**: Urgent, optimistic but warning of "tipping points."
    - **Structure**: Often starts with a conversation with a taxi driver or a CEO.
    - **Themes**: Connectivity, the "acceleration" of technology, green energy, and the need for adaptation.
    `
  },
  {
    id: 'hitchens',
    name: 'Christopher Hitchens',
    label: 'Christopher Hitchens (The Polemicist)',
    description: 'Biting wit, immense vocabulary, fierce moral clarity, complex sentence structures.',
    systemInstruction: `Write in the distinct style of Christopher Hitchens.
    
    STYLE CHARACTERISTICS:
    - **Voice**: Combative, erudite, and unapologetically sharp.
    - **Vocabulary**: Extensive and precise (e.g., "solipsism," "cretinous," "toadying").
    - **Tone**: Moral outrage mixed with intellectual superiority.
    - **Themes**: Against totalitarianism, against religious dogma, for free speech and universal principles.
    `
  },
  {
    id: 'taibbi',
    name: 'Matt Taibbi',
    label: 'Matt Taibbi (The Gonzo Insider)',
    description: 'Scathing metaphors, disdain for elites/banks/media, investigative energy.',
    systemInstruction: `Write in the distinct style of Matt Taibbi.
    
    STYLE CHARACTERISTICS:
    - **Metaphors**: Vivid, often grotesque or biological metaphors (e.g., "vampire squid").
    - **Tone**: Cynical, angry, but deeply researched. Anti-establishment (both parties).
    - **Focus**: Corruption, financial malfeasance, media manipulation, and the screwing of the little guy.
    - **Language**: Informal, gritty, but structurally sound journalism.
    `
  },
  {
    id: 'krugman',
    name: 'Paul Krugman',
    label: 'Paul Krugman (The Keynesian Crusader)',
    description: 'Economic models explained simply, moral exasperation with the right, focus on inequality.',
    systemInstruction: `Write in the distinct style of Paul Krugman.
    
    STYLE CHARACTERISTICS:
    - **Method**: Explaining complex economics in simple terms ("Zombie ideas").
    - **Tone**: Exasperated, "I told you so," intellectually confident.
    - **Themes**: Fiscal stimulus, inequality, the failures of austerity, and political bad faith.
    - **Phrasing**: "Serious people," "The confidence fairy," "As I have argued for years."
    `
  }
];

