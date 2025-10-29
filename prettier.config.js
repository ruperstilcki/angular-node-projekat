module.exports = {
  printWidth: 120, // Maksimalna širina linije pre prelama (120 karaktera)
  tabWidth: 2, // Širina indentacije = 2 razmaka
  useTabs: false, // Koristi razmake umesto tab karaktera
  semi: true, // Dodaje tačku-zarez na kraju svake naredbe
  singleQuote: true, // Koristi jednostruke navodnike (') umesto duplih
  trailingComma: 'none', // NE dodaje zarez na kraju poslednjeg elementa u objektima/nizovima
  bracketSpacing: true, // Dodaje razmake unutar vitičastih zagrada: { foo: bar }
  arrowParens: 'avoid', // Izbegava zagrade kod arrow funkcija sa jednim parametrom: x => x
  overrides: [
    // Specifična podešavanja za različite tipove fajlova
    {
      files: '*.html', // Primenjuje se na sve HTML fajlove
      options: {
        tabWidth: 2 // Koristi 2 razmaka za indentaciju u HTML fajlovima
      }
    },
    {
      files: '*.json', // Primenjuje se na sve JSON fajlove
      options: {
        tabWidth: 2 // Koristi 2 razmaka za indentaciju u JSON fajlovima
      }
    },
    {
      files: '*.scss', // Primenjuje se na sve SCSS fajlove
      options: {
        tabWidth: 2 // Koristi 4 razmaka za indentaciju u SCSS fajlovima
      }
    }
  ]
};
