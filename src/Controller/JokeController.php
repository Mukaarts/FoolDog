<?php

namespace App\Controller;

use App\Entity\Joke;
use App\Repository\JokeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class JokeController extends AbstractController
{
    private const FALLBACK_JOKES = [
        'Warum können Geister so schlecht lügen? Weil man durch sie hindurchsehen kann.',
        'Was sagt ein Hund, der meditiert? Wuuuuff.',
        'Warum tragen Hunde kein Parfüm? Weil sie schon gut riechen.',
        'Was macht ein Hund auf einem Schiff? Er wedelt mit dem Heck.',
        'Warum sind Hunde so gute Musiker? Weil sie die besten Riffs bellen können.',
        'Was bestellt ein Hund im Restaurant? Ein Bellini.',
        'Warum gehen Hunde nicht ins Kino? Weil sie immer den Film verbellen.',
        'Was sagt der Hund zum Knochen? Schön dich zu nagen!',
        'Wie nennt man einen Hund ohne Beine? Ist egal, er kommt eh nicht wenn man ihn ruft.',
        'Was macht ein Hund in der Sahara? Verdursten. – War kein guter Witz? Na gut: Er sucht den Sand-wich.',
        'Warum wedeln Hunde mit dem Schwanz? Weil der Schwanz nicht mit dem Hund wedeln kann.',
        'Was ist ein Hund im Herbst? Ein Laubwedler.',
    ];

    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('joke/index.html.twig');
    }

    #[Route('/api/joke/random', name: 'api_joke_random', methods: ['GET'])]
    public function randomJoke(JokeRepository $jokeRepository): JsonResponse
    {
        $joke = $jokeRepository->findRandom();

        if ($joke) {
            return $this->json([
                'joke' => $joke->getContent(),
                'author' => $joke->getAuthor(),
                'source' => 'database',
            ]);
        }

        return $this->json([
            'joke' => self::FALLBACK_JOKES[array_rand(self::FALLBACK_JOKES)],
            'author' => 'FoolDog',
            'source' => 'fallback',
        ]);
    }

    #[Route('/api/joke/ai', name: 'api_joke_ai', methods: ['GET'])]
    public function aiJoke(): JsonResponse
    {
        // AI-generierte Witze - hier werden zufällig generierte Hunde-Witze zusammengebaut
        $subjects = ['Der Hund', 'Ein Dackel', 'Der Pudel', 'Ein Labrador', 'Die Bulldogge', 'Ein Chihuahua'];
        $actions = [
            'ging zum Friseur und sagte: "Einmal Pudel-Schnitt bitte!"',
            'rief beim Tierarzt an: "Ich kann nicht kommen, ich bin auf den Hund gekommen!"',
            'bestellte im Restaurant einen Hundekuchen. Der Kellner fragte: "Mit oder ohne Leine?"',
            'schrieb ein Buch. Titel: "Wuff - Mein Leben in 50 Bällen"',
            'wurde Programmierer. Sein erstes Programm? Ein Bark-End Framework!',
            'ging zur Schule und wurde Klassenbester im Fach "Stöckchen-Mathematik"',
            'eröffnete ein Restaurant. Spezialität: Knochen-Suppe à la Wuff',
            'wurde Detektiv. Sein Motto: "Ich schnüffle jeden Fall auf!"',
            'startete einen Podcast. Name: "Bellcast - Der Podcast für Vierbeiner"',
            'wurde Influencer. Sein Content: "10 Wege deinen Menschen zu erziehen"',
        ];

        $joke = $subjects[array_rand($subjects)] . ' ' . $actions[array_rand($actions)];

        return $this->json([
            'joke' => $joke,
            'author' => 'FoolDog AI',
            'source' => 'ai',
        ]);
    }

    #[Route('/api/joke/submit', name: 'api_joke_submit', methods: ['POST'])]
    public function submitJoke(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $content = trim($data['content'] ?? '');
        $author = trim($data['author'] ?? 'Anonym');

        if ($content === '') {
            return $this->json(['error' => 'Witz darf nicht leer sein!'], Response::HTTP_BAD_REQUEST);
        }

        if (mb_strlen($content) > 1000) {
            return $this->json(['error' => 'Witz ist zu lang! Maximal 1000 Zeichen.'], Response::HTTP_BAD_REQUEST);
        }

        $joke = new Joke();
        $joke->setContent($content);
        $joke->setAuthor($author);

        $em->persist($joke);
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Witz erfolgreich eingereicht!',
            'joke' => $joke->getContent(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/jokes', name: 'api_jokes_list', methods: ['GET'])]
    public function listJokes(JokeRepository $jokeRepository): JsonResponse
    {
        $jokes = $jokeRepository->findBy([], ['id' => 'ASC']);

        $data = array_map(fn(Joke $j) => [
            'id' => $j->getId(),
            'emoji' => $j->getEmoji(),
            'content' => $j->getContent(),
        ], $jokes);

        return $this->json($data);
    }
}
