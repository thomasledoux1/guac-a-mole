/**
 * Every user-visible string lives here. The game ships in English only, but
 * keeping the copy in one module means swapping in a translation library later
 * touches this file and nothing else.
 */
export const strings = {
  title: 'Guac-a-Mole',
  tagline: 'Whack the avocados. Make the guacamole.',
  play: 'Start whacking',
  playAgain: 'Play again',
  howToTitle: 'How to play',
  howTo: [
    'Whack ripe avocados to fill the bowl.',
    'Leave the brown ones alone, they cost you points.',
    'Golden avocados are worth triple and add three seconds.',
    'Three hits in a row raise your multiplier, up to 5x.',
  ],
  hudTime: 'Time',
  hudScore: 'Score',
  hudBest: 'Best',
  hudBowl: 'Guacamole',
  multiplier: (value: number) => `${value}x`,
  countdownGo: 'Go',
  paused: 'Paused',
  resume: 'Resume',
  quit: 'Give up',
  results: {
    sad: { title: 'Sad Dip', blurb: 'Technically guacamole. Nobody is going back for seconds.' },
    decent: { title: 'Decent Guac', blurb: 'Solid work. This bowl will be empty by halftime.' },
    legendary: { title: 'Legendary Guac', blurb: 'People will talk about this bowl for years.' },
  },
  finalScore: 'Final score',
  newBest: 'New personal best',
  statAvocados: 'Avocados',
  statCombo: 'Best streak',
  statAccuracy: 'Accuracy',
  muteOn: 'Sound off',
  muteOff: 'Sound on',
} as const
