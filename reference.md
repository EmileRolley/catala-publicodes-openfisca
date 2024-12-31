# Impôt fictif sur le revenu

Reprise de l'exemple fictif du [tutoriel de
Catala](https://catala-lang.org/fr/examples/tutoriel) qui définit un impôt sur
le revenu. La version du programme Catala est disponible dans le fichier
[`tutoriel_fr.catala_fr`](./catala/tutoriel_fr.catala_fr).

Cet impôt sur le revenu est définit à travers différents articles de loi,
chacun d’eux étant introduit par un en-tête. Le premier commence ici :

## Article 1

L’impôt sur le revenu pour une personne est défini comme un pourcentage fixe
des revenus de la personne pour une année.

## Article 2

Le pourcentage fixe mentionné à l’article 1 est égal à 20%.

## Article 3

Si l’individu a à sa charge deux ou plus enfants, alors
le pourcentage fixe mentionné à l’article 1 vaut 15 %.

### Article 3 bis

Seul les enfants mineurs sont élligibles pour l’application de l’article 3.

### Article 4

Le montant de l’impôt pour le calcul à deux tranches est égal au montant
de l’impôt de chaque tranche, multiplié par le taux de chaque tranche.

### Article 5

Pour les individus dont le revenu est supérieur à 100 000€, l’impôt sur
le revenu de l’article 1 est de 40% du revenu au-delà de 100 000€.
En dessous de 100 000€, l’impôt sur le revenu est de 20% du revenu.

### Article 6

Les personnes ayant moins de 10 000€ de revenus sont exemptés de l’impôt
sur le revenu prévu à l’article 1.

Et voilà ! Nous avons défini un calcul d’impôt à deux tranches en annotant
tout simplement un texte législatif par des bouts de code Catala.
Cependant, les lecteurs attentifs ont vu quelque chose de curieux dans les
articles 5 et 6. Que se passe-t-il si le revenu d’une personne est inférieur
à 10 000€ ? Tout de suite, les deux définitions de l’article 5 et 6
pour l’impôt sur le revenu s’appliquent, et ils sont en conflit.

La loi ne le précise pas; nos articles sont clairement mal rédigés.
Mais Catala vous aide à trouver ce genre d’erreur par de simples tests ou
même la vérification formelle. Commençons par les tests.

## Tester les programmes Catala

Tester les programmes Catala peut se faire directement en Catala. En effet,
écrire des cas de tests pour chaque champ d’application Catala que vous
définissez est une bonne pratique, qui est appelée « tests unitaires » dans
la communauté du génie logicielle.
Les cas de test sont définis dans des champs d’application :

### Tester NouveauCalculImpotRevenu

```catala
déclaration champ d'application Test1:
  # Incluons le champ d’application du calcul de l’impôt comme un sous-champ
  calcul_impôt champ d'application NouveauCalculImpôtRevenu
  résultat impôt_revenu contenu argent

# Pour éxécuter ce test, en supposant que le compilateur Catala peut être
# appelé avec « catala », entrez la commande suivante :
#   catala Interpret --scope=Test1 tutoriel_fr.catala_fr

champ d'application Test1:
  définition calcul_impôt.personne égal à
    # On définit le paramètre au sous-champ d’application, puis les
    # quatre lignes ci-dessous définissent une structure entière,
    # dans laquelle nous y mettons des valeurs.
    Personne {
      -- revenu: 230 000€
      -- nombre_enfants: 0
    }
  définition impôt_revenu égal à calcul_impôt.impôt_revenu
  # Ensuite nous récupérons le montant de l’impôt, calculé par
  # le sous-champ d’application, et nous écrivons l’assertion de
  # la valeur attendue : (230 000€ - 100 000€) * 40% + 100 000€ * 20% = 72 000€
  assertion impôt_revenu = 72 000€
```

Ce test devrait être bon. Maintenant étudions un test en échec :

```catala
déclaration champ d'application Test2:
  calcul_impôt champ d'application NouveauCalculImpôtRevenu
  résultat impôt_revenu contenu argent

champ d'application Test2:
  définition calcul_impôt.personne égal à Personne {
    -- revenu: 4 000€
    -- nombre_enfants: 0
  }

  définition impôt_revenu égal à calcul_impôt.impôt_revenu
  assertion impôt_revenu = 0€
```

Ce cas de test devrait calculer un impôt sur le revenu de 0€,
en raison de l’article 6. Mais au lieu de cela, l’exécution produira
une erreur car il y a un conflit entre les règles.

## Définir des exceptions à des règles

En effet, la définition d’un impôt sur le revenu à l’article 6 entre en
conflit avec la définition de l’article 5. Mais en réalité, l’article 6
est une simple exception à l’article 5. Dans la loi, il est implicite que
si l’article 6 est applicable, alors son application est prioritaire
sur l’article 5.

### Régler correctement le calcul

Cette priorité implicite doit être explicitement déclarée en Catala.
Voici une version correcte du champ d'application NouveauCalculImpotRevenu :

```catala
déclaration champ d'application NouveauCalculImpôtRevenuCorrect:
  deux_tranches champ d'application CalculImpôtDeuxTranches
  entrée personne contenu Personne
  résultat formule_imposition contenu argent dépend de revenu contenu argent
  contexte résultat impôt_revenu contenu argent
  # Cette variable est marquée avec un « contexte », un nouveau concept que
  # nous n’avons pas encore introduit. Pour le moment, ignorons le jusqu’à
  # ce que nous revenions dessus dans la section « Variables de contexte ».

champ d'application NouveauCalculImpôtRevenuCorrect :
  définition deux_tranches.tranches égal à DeuxTranches {
    -- seuil: 100 000€
    -- taux1: 20%
    -- taux2: 40%
  }
  définition formule_imposition de revenu égal à
    deux_tranches.formule_imposition de revenu
```

Pour définir une exception à une règle, vous devez d’abord étiquetter
la règle à laquelle vous voulez attacher l’exception. Vous pouvez mettre
n’importe quel identifiant en « snake_case » pour l’étiquette :

```catala
champ d'application NouveauCalculImpôtRevenuCorrect:
  étiquette article_5
  définition impôt_revenu égal à
    deux_tranches.formule_imposition de personne.revenu

  # Puis, vous pouvez déclarez l’exception qui se réfère à l’étiquette
  exception article_5
  définition impôt_revenu sous condition
    personne.revenu <= 10 000€
  conséquence égal à 0€
```

Et le test devrait désormais fonctionner :

```catala
déclaration champ d'application Test3:
  calcul_impôt champ d'application NouveauCalculImpôtRevenuCorrect
  résultat impôt_revenu contenu argent

champ d'application Test3:
  définition calcul_impôt.personne égal à Personne {
    -- revenu: 4 000€
    -- nombre_enfants: 0
  }
  définition impôt_revenu égal à calcul_impôt.impôt_revenu
  assertion impôt_revenu = 0€
```

### Définir des exceptions aux groupes de règles

Notez que le système d’étiquettes vous permet de définir des modèles
d’exception plus compliqués. Parfois, vous voulez déclarer une exception
à un groupe de définitions par morceau. Pour cela, utilisez simplement la
même étiquette à tout un morceau de définitions.

### Les exceptions cumulatives

Comme nous l’avons vu… Deux exceptions s’appliquant pour une même règle, au même
moment, sont en conflits et déclenchent une erreur. Cela arrive, cependant,
que ces exceptions produisent le même résultat à la fin : par convenance, Catala
tolère ce cas et retourne le résultat commun, aussi longtemps qu’il y a une
stricte égalité syntaxique.

#### Article 6 bis

Des personnes avec 7 enfants ou plus sont exonérées de l’impôt sur le revenu
mentionné à l’article 1.

```catala
champ d'application NouveauCalculImpôtRevenuCorrect:
      exception article_5
      définition impôt_revenu sous condition
        personne.nombre_enfants >= 7
      conséquence égal à 0€
```

Le même problème devrait être déclenché ci-dessus, pour des familles avec un
revenu en dessous de 10 000€ et avec 7 enfants ou plus. Mais Catala peut
détecter qu’il n’y aura pas de problèmes puisque le résultat est une éxonération
dans les 2 cas.

### Les appels directs au champ d'application

Dans certains cas, il est utile d’appliquer le calcul d’un champ d’application
seulement sous des circonstances spécifiques. Par exemple, certaines allocations
sociales peuvent avoir différents modes de calcul, qui dépendent de la situation
des allocataires. Dans ce cas définir chacun de ces modes de calcul, comme un
sous-champ d’application, est ennuyeux pour deux raisons : premièrement,
certaines valeurs en entrée peuvent ne pas être pertinantes dans des cas où
un allocataire n’est pas concerné, et le langage continuera d’éxiger à ce que
vous ne laissez rien d’indéfini ; deuxièmement, un calcul inutile aura lieu.

Pour ces cas, il est possible d’appeler un champ d'application directement, en
spécifiant en même temps toutes ses variables d’entrées, et de récupérer ses
variables de résultat de la même manière qu’avec des sous-champs d’application.

```catala
déclaration champ d'application Test5:
  interne personne contenu Personne
  interne est_applicable_au_calcul_normal_impôt_revenu contenu booléen
  résultat impôt_revenu contenu argent

champ d'application Test5:
  définition personne égal à Personne {
    -- revenu: 7 000€
    -- nombre_enfants: 7
  }
  définition impôt_revenu égal à
    si est_applicable_au_calcul_normal_impôt_revenu alors
      (résultat de NouveauCalculImpôtRevenuCorrect avec
      	 { -- personne: personne }).impôt_revenu
    sinon 0€ # Insérez d’autres modes de calcul ici
```

Ici le syntaxe « NouveauCalculImpôtRevenuCorrect avec » déclenche un appel
au champ d’application, qui valorise sa variable d’entrée « personne ».
Ensuite, la syntaxe du point « . » est utilisée pour récupérer le résultat
« impôt_revenu » du champ d’application.

## Les variables contextuelles d’un champ d'application

Avec ses variables « entrée », « interne » et « résultat », les champs
d’application de Catala sont proches des fonctions avec des paramètres,
des variables locales et des variables retournant un résultat. Cependant,
la loi peut parfois être contradictoire aux bonnes pratiques de programmation,
et ainsi définir des dispositions qui cassent la barrière d’abstraction
normalement associée à une fonction.

Ceci peut être le cas quand un corps extérieur du texte législatif « réutilise »
un concept légal, mais en y ajoutant un changement. Considérez l’exemple fictif
suivant (mais pas tout à fait pathologique d’un point de vue informatique).

### Article 7

Le système de justice inflige des amendes aux individus quand ils commettent une
infraction. Les amendes sont déterminées en fonction du montant des impôts payés
par le particulier. Plus l’individu paie d’impôts, plus l’amende est élevée.
Toutefois la détermination du montant de l’impôt à payer par un particulier,
dans ce contexte, comprend des frais d’imposition fixes de 500€ pour les
particuliers gagnant moins de 10 000€.

```catala
# Pour calculer la base qui détermine l’imposition de l’amende, nous créons
# un nouveau champ d’application.
déclaration champ d'application DétermineBaseAmende:
   calcul_impôt champ d'application NouveauCalculImpôtRevenuCorrect
   entrée personne contenu Personne
   résultat base_amende contenu argent

champ d'application DétermineBaseAmende:
  # Tout d’abord, nous relions l’entrée et le résultat des
  # deux champs d’applications.
  définition calcul_impôt.personne égal à personne
  définition base_amende égal à calcul_impôt.impôt_revenu

  # Mais ensuite, comment prend-on en compte l’application de la loi qui
  # rétablit le mécanisme d’annulation de l’impôt, pour les particuliers
  # gagnant moins de 10 000€ ?

  # C'est là que le concept de « contexte » entre en jeu. En effet, nous avions
  # annoté la variable « impôt_revenu », de « NouveauCalculImpôtRevenuCorrect »,
  # avec l’attribut « contexte ».
  # « contexte » est une variante de « entrée » qui expose la variable en tant
  # qu’entrée du champ d'application. Cependant, elle est plus permissive que
  # « entrée » car elle vous permet de redéfinir la variable « contexte » dans
  # son propre champ d'application. Vous êtes alors confronté à un choix pour
  # la valeur de « impôt_revenu » : prenez-vous la valeur venant de sa
  # définition, à l’intérieur de « NouveauCalculImpôtRevenuCorrect », ou
  # prenez-vous la valeur venant de l’entrée du champ d'application ?
  # Ce dilemme est résolu de deux manières.
  # Premièrement, en examinant les conditions des définitions : seules les
  # définitions, dont la condition est évaluée à « vrai > au moment de
  # l’exécution, seront prises en compte. S’il n’y en a qu'une, le choix est
  # facile. Mais que se passe-t-il si deux définitions se déclenchent en même
  # temps, l’une provenant de l’entrée et l’autre du champ d'application
  # « NouveauCalculImpôtRevenuCorrect » ?
  # Deuxièmement, dans ce cas, nous donnons toujours la priorité à la définition
  # de l’entrée. Dans Catala, pour la variable « contexte », le champ
  # d'application de l’appelant a la priorité sur le champ d'application de
  # l’appelé. C'est comme si l’appelant fournissait une exception supplémentaire
  # pour la définition de la variable du champ d'application.

  # Pour en revenir à notre petit problème, la solution est ici de fournir,
  # depuis l’extérieur, une définition exceptionnelle de l’impôt sur le revenu
  # pour les personnes gagnant moins de 10 000€.
  définition calcul_impôt.impôt_revenu sous condition
    personne.revenu <= 10 000€
  conséquence égal à 500€
```

## Une variable, plusieurs états

Lorsqu'une quantité est mentionnée dans la loi, elle ne correspond pas toujours
exactement à une variable unique de Catala. Plus précisément, il arrive souvent
que la loi définisse une quantité unique avec plusieurs étapes de calcul,
chacune s’appuyant sur la précédente. Voici un exemple d’une telle
configuration et la manière de la traiter grâce à une fonction dédiée de Catala.

Sous le capot, les différents états d’une variable de Catala sont mis en
œuvre par des variables distinctes, à l’intérieur des représentations
intermédiaires-inférieures du langage.

### Article 8

Fiscalement parlant, la valeur du bâtiment exploité à des fins caritatives peut
être déduite du patrimoine d’une personne, qui est alors plafonné à 2 500 000€.

```catala
déclaration champ d'application ImpôtSurLaFortune:
  entrée valeur_du_bâtiment_pour_exploitation_caritative contenu argent
  entrée total_du_patrimoine contenu argent
  interne patrimoine contenu argent
    # Après le type de la variable, nous pouvons définir la liste ordonnée
    # des états que la variable doit prendre avant de calculer sa valeur finale.
    # À chaque état, nous pourrons nous référer à la valeur de l’état précédent.
    état total
    état après_déduction_caritative
    état après_plafonnement

champ d'application ImpôtSurLaFortune:
  définition patrimoine état total égal à total_du_patrimoine
  définition patrimoine état après_déduction_caritative égal à
    patrimoine - valeur_du_bâtiment_pour_exploitation_caritative
    # Ci-dessus, « patrimoine » se réfère à l’état « total »
  définition patrimoine état après_plafonnement égal à
    si patrimoine >= 2 500 000€ alors 2 500 000€ sinon patrimoine
    # Ci-dessus, « patrimoine » réfère à l’état « après_déduction_caritative »
  assertion patrimoine > 0€
  # En dehors de la définition de « patrimoine », « patrimoine » réfère toujours
  # à l’état final de la variable, ici « après_plafonnement ».
```

## Les types de données de Catala

Jusqu'à présent, ce tutoriel vous a présenté la structure de base des programmes
Catala avec le champ d'application, les définitions et les exceptions. Mais pour
être en mesure de gérer la plupart des lois, Catala vient en soutien avec les
types de données habituels sur lesquels les calculs legislatifs opèrent.

### Booléens

Le booléen est le type de donnée le plus élémentaire dans Catala : sa valeur
peut être soit à « vrai », soit à « faux ». La condition est un simple booléen
avec une valeur par défaut à « faux ». Rendez-vous à la section qui
concerne les conditions, décrite plus haut.

```catala
déclaration champ d'application ValeursBooléennes:
  interne valeur1 condition
  interne valeur2 contenu booléen

champ d'application ValeursBooléennes:
  règle valeur1 sous condition faux et vrai conséquence rempli
  # Mets le booléen de la condition « valeur1 » à « vrai »,
  # si la condition « faux et vrai » est respectée.
  définition valeur2 égal à valeur1 ou bien (valeur1 et vrai) = faux
  # Les opérateurs booléens incluent « et », « ou », « ou bien »
```

### Entiers

Les entiers dans Catala sont en précision infinie : ils se comportent comme
des vrais entiers en mathématique, et non comme des entiers d’ordinateur qui
sont limités par une valeur maximale, en raison de leur stockage sur 32 ou
64 bits. Les entiers peuvent être négatifs.

```catala
déclaration champ d'application ValeursEntières:
  interne valeur1 contenu entier
  interne valeur2 contenu entier

champ d'application ValeursEntières:
  définition valeur1 sous condition 12 - (5 * 3) < 65 conséquence égal à 45 * 9
  # L’opérateur « / » correspond à une division entière qui tronque vers 0.
  définition valeur2 égal à valeur1 * valeur1 * 65 * 100
```

### Décimales

Les décimales dans Catala sont aussi en précision infinie, qui se comportent
comme de vrais nombres rationnels en mathématique, et non comme des nombres
à virgule flottante dans un ordinateur qui effectuent des calculs approxmatifs.
Les opérateurs sont suffixés avec « , ».

```catala
déclaration champ d'application ValeursDécimales:
  interne valeur1 contenu décimal
  interne valeur2 contenu décimal

champ d'application ValeursDécimales:
  définition valeur1 sous condition
    12,655465446655426 - 0,45265426541654  < 12,3554654652
  conséquence égal à 45 / 9
  # L’opérateur « / » correspond à une division éxacte.
  # La division d’entiers produit une décimale.
  définition valeur2 égal à valeur1 * valeur1 * 65%
  # Les pourcentages sont des nombres décimaux (ici 0,65)
```

### Argent

En Catala, l’argent est simplement représenté par un nombre entier de centimes.
Il n’est pas possible en Catala d’avoir une quantité d’argent plus précise
qu'un centime. Cependant, vous pouvez multiplier une quantité d’argent
avec une décimale, et le résultat est arrondi au centime le plus proche.

Ce comportement vous permet de repérer l’endroit où vous avez besoin
de précision dans vos calculs et de sélectionner les décimales en guise de
précision, au lieu de vous fier sur des chiffres monétaires, où la précision
est de l’ordre du centime d’euro. Deux sommes d’argent peuvent être divisées,
produisant une décimale.

```catala
déclaration champ d'application ValeursMonétaires:
  interne valeur1 contenu décimal
  interne valeur2 contenu argent

champ d'application ValeursMonétaires:
  définition valeur1 sous condition
    12,655465446655426 - 0,45265426541654  < 12,3554654652 conséquence
  égal à (décimal de 45) / (décimal de 9)
  définition valeur2 égal à
    1,00€ * (((6 520,23€ - 320,45€) * valeur1) / 45€)
```

### Dates et durées

Catala prend en charge les dates du calendrier grégorien, ainsi que les calculs
de durée en termes de jours, de mois et d’années. La soustraction entre une date
et une durée est mesurée en jours, et l’addition entre une date et une durée
donne une nouvelle date. Les durées sont mesurées en jours, en mois ou en années
et ne peuvent pas être mélangées, car les mois et les années n’ont pas toujours
le même nombre de jours. Cette non-mixité n’est pas prise en compte par le
système de typage de Catala, mais des erreurs seront générées à l’exécution.
Les dates sont spécifiées selon la norme ISO 8601 afin d’éviter toute confusion
entre les notations américaines et européennes. Les opérateurs de date sont
préfixés par « @ », tandis que les opérateurs de durée sont préfixés par « ^ ».

```catala
déclaration champ d'application ValeursDate:
  interne valeur1 contenu date
  interne valeur2 contenu durée

champ d'application ValeursDate:
  définition valeur1 égal à |2000-01-01| + 1 an # produit |2001-01-01|
  définition valeur2 égal à
    (valeur1 - |1999-12-31|) + 45 jour # 367 + 45 jours (2000 est bissextile)
```

### Collections

Souvent, les programmes Catala ont besoin de parler de collection de données
parce que la loi parle du nombre d’enfants, du maximum d’une liste, etc. Catala
propose un support de première classe pour les listes. Vous pouvez créer une
liste, filtrer ses éléments, mais aussi agréger son contenu pour calculer toutes
sortes de valeurs.

```catala
déclaration champ d'application ValeursDeListe:
  interne valeur1 contenu liste de entier
  interne valeur2 contenu entier

champ d'application ValeursDeListe:
  définition valeur1 égal à [45;-6;3;4;0;2155]
  définition valeur2 égal à somme entier de (i * i) pour i parmi valeur1
  # somme de carré
```

## Conclusion

Ce tutoriel présente les concepts de base et la syntaxe des fonctionnalités
du langage Catala. C’est à vous de les utiliser pour annoter du texte
législatif avec leur traduction algorithmique.

Il n’y a pas une seule bonne façon d’écrire des programmes Catala, car le style
de programmation doit être adapté au texte de loi qui sera annoté. Cependant,
le coeur de Catala est un langage de programmation fonctionnelle.
Par conséquent, suivre les modèles de conception habituels de la programmation
fonctionnelle devrait aider à obtenir du code concis et lisible.

# Annexe A : Les définitions de valeurs de premier niveau

Les définitions de premier niveau permettent de définir des valeurs ou
des fonctions directement dans le programme, sans les placer dans un champ
d’application. Cela est utile pour les constantes ou les fonctions d’aide,
comme le montrent les exemples ci-dessous.

Les définitions de premier niveau sont disponibles, en les appelant par leur nom,
dans tout le programme ; elles peuvent dépendre les unes des autres (tant qu'il
n’y a pas de cycles), mais elles ne sont pas autorisées à être dépendantes des
évaluations faites dans des champs d’application.

## Example 1: Les constantes de premier niveau

### A. En utilisant les définitions du champ d'application

a. Dans ce corpus, le nombre de jours de travail par semaine est supposé
être de 5.

```catala
déclaration champ d'application NombreDeJoursTravaillésParSemaine:
  résultat valeur contenu entier

champ d'application NombreDeJoursTravaillésParSemaine:
  définition valeur égal à 5
  # L’obligation de déclarer le champ d'application avec une simple variable
  # de résultat est assez lourde et nuit à la lisibilité.
```

b. Les frais de repas sont de 2€ par jour de travail, sur le nombre de
semaines travaillées.

```catala
déclaration champ d'application FraisDeRepas_A:
  entrée nombre_de_semaines_travaillées contenu entier
  nombre_de_jours_travaillés_par_semaine champ d'application
    NombreDeJoursTravaillésParSemaine
    # Le sous-champ d'application doit être déclaré pour accéder à sa valeur.
    # Dans certains cas, il peut être bon d’avoir une dépendance explicite.
  résultat valeur contenu argent

champ d'application FraisDeRepas_A:
  définition valeur égal à
    2€ * (nombre_de_semaines_travaillées *
          nombre_de_jours_travaillés_par_semaine.valeur / 7)
          # La syntaxe est <nom_du_champ_d’application>.<nom_de_variable>
	  # afin d’accéder à la valeur
```

### B. En utilisant les définitions de premier niveau

a. À travers ce corpus, le nombre de jours de travail par semaine est supposé
être 5.

```catala
déclaration nombre_de_jours_travaillés_par_semaine contenu entier égal à 5
# C’est plus simple: une déclaration et une valeur sont données en une fois,
# il n’est pas nécessaire d’un nom de sous-variable.
```

b. Les frais de repas sont de 2€ par jour de travail, sur le nombre de
semaines travaillées.

```catala
déclaration champ d'application FraisDeRepas_B:
  entrée nombre_de_semaines_travaillées contenu entier
  résultat valeur contenu argent

champ d'application FraisDeRepas_B:
  définition valeur égal à
    2€ * (nombre_de_semaines_travaillées *
          nombre_de_jours_travaillés_par_semaine / 7)
          # Il n’est pas nécessaire d’un sous-champ d'application, la valeur
          # de « nombre_de_jours_travaillés_par semaine » est accessible
	  # directement par son nom
```

## Exemple 2: Les fonctions de premier niveau

a. L’allocation de base est égale à 30% du loyer

```catala
déclaration champ d'application Allocation:
  entrée loyer contenu argent
  résultat valeur contenu argent
    état de_base
    état final

champ d'application Allocation:
  définition valeur état de_base égal à loyer * 30%
```

### A. Avec la syntaxe actuelle

b. L’allocation finale est arrondie au multiple supérieur de 100€.

```catala
champ d'application Allocation:
  définition valeur état final égal à
    arrondi de (valeur / 100,0 + 0,49€) * 100,0
    # Ici vous devriez expliquer pourquoi cette formule fait ce que
    # le texte exprime, puisque c’est loin d’être évident.
    # Ça n’est pas grave s’il est utilisé qu’une seule fois, mais c’est loin
    # d’être l’idéal si cet arrondi spécifique est utilisé partout dans la loi.
```

### B. Nouvelle syntaxe proposée pour les « fonctions de niveau supérieur »

b. L’allocation finale est arrondie au multiple supérieur de 100€

```catala
déclaration arrondi_supérieur_à_100
    contenu argent
    dépend de montant contenu argent
  égal à
    arrondi de (montant / 100,0 + 0,49€) * 100,0
    # L’explication est encore nécessaire, bien que
    # ça n’encombre pas le champ d'application actuel.
    # Cette définition pourrait même être mise dans le prologue.

champ d'application Allocation:
  définition valeur état final égal à arrondi_supérieur_à_100 de valeur
```

## Exemple 3: Des fonctions avec plusieurs paramètres

Le montant à inclure dans le revenu brut est l’excédent de la juste valeur
marchande du bien sur le montant payé.

```catala-metadata
déclaration champ d'application InclureDansRevenuBrut:
  entrée juste_valeur_marchande contenu argent
  entrée montant_payé contenu argent
  résultat montant_à_inclure contenu argent
```

### A. Avec la syntaxe actuelle

```catala
champ d'application InclureDansRevenuBrut:
  définition montant_à_inclure égal à
    si juste_valeur_marchande > montant_payé alors
      juste_valeur_marchande - montant_payé
    sinon
      0€
    # C’est essentiellement la définition de « l’excédent de »
```

### B. Avec une fonction à deux paramètres

```catala
déclaration excédent
  contenu argent
  dépend de x contenu argent,
            y contenu argent
  égal à
    si x > y alors x - y
    sinon 0€

champ d'application InclureDansRevenuBrut:
  définition montant_à_inclure égal à
    excédent de juste_valeur_marchande, montant_payé
```
