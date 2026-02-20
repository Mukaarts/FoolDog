<?php

namespace App\Controller;

use App\Entity\Joke;
use App\Repository\JokeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminController extends AbstractController
{
    #[Route('', name: 'admin_dashboard')]
    public function dashboard(JokeRepository $jokeRepository): Response
    {
        $jokes = $jokeRepository->findBy([], ['id' => 'DESC']);

        return $this->render('admin/dashboard.html.twig', [
            'jokes' => $jokes,
        ]);
    }

    #[Route('/joke/new', name: 'admin_joke_new')]
    public function newJoke(Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            if (!$this->isCsrfTokenValid('joke_form', $request->request->get('_token'))) {
                $this->addFlash('error', 'CSRF-Token ongëlteg.');
                return $this->redirectToRoute('admin_joke_new');
            }

            $content = trim($request->request->get('content', ''));
            $emoji = trim($request->request->get('emoji', ''));
            $author = trim($request->request->get('author', ''));

            if ($content === '') {
                $this->addFlash('error', 'Den Inhalt dierf net eidel sinn!');
                return $this->render('admin/joke_form.html.twig', [
                    'joke' => null,
                    'form_data' => ['content' => $content, 'emoji' => $emoji, 'author' => $author],
                ]);
            }

            $joke = new Joke();
            $joke->setContent($content);
            $joke->setEmoji($emoji ?: null);
            $joke->setAuthor($author ?: null);

            $em->persist($joke);
            $em->flush();

            $this->addFlash('success', 'Witz ugeluecht!');
            return $this->redirectToRoute('admin_dashboard');
        }

        return $this->render('admin/joke_form.html.twig', [
            'joke' => null,
            'form_data' => null,
        ]);
    }

    #[Route('/joke/{id}/edit', name: 'admin_joke_edit')]
    public function editJoke(Joke $joke, Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            if (!$this->isCsrfTokenValid('joke_form', $request->request->get('_token'))) {
                $this->addFlash('error', 'CSRF-Token ongëlteg.');
                return $this->redirectToRoute('admin_joke_edit', ['id' => $joke->getId()]);
            }

            $content = trim($request->request->get('content', ''));
            $emoji = trim($request->request->get('emoji', ''));
            $author = trim($request->request->get('author', ''));

            if ($content === '') {
                $this->addFlash('error', 'Den Inhalt dierf net eidel sinn!');
                return $this->render('admin/joke_form.html.twig', [
                    'joke' => $joke,
                    'form_data' => ['content' => $content, 'emoji' => $emoji, 'author' => $author],
                ]);
            }

            $joke->setContent($content);
            $joke->setEmoji($emoji ?: null);
            $joke->setAuthor($author ?: null);

            $em->flush();

            $this->addFlash('success', 'Witz aktualiséiert!');
            return $this->redirectToRoute('admin_dashboard');
        }

        return $this->render('admin/joke_form.html.twig', [
            'joke' => $joke,
            'form_data' => null,
        ]);
    }

    #[Route('/joke/{id}/delete', name: 'admin_joke_delete', methods: ['POST'])]
    public function deleteJoke(Joke $joke, Request $request, EntityManagerInterface $em): Response
    {
        if (!$this->isCsrfTokenValid('delete_joke_' . $joke->getId(), $request->request->get('_token'))) {
            $this->addFlash('error', 'CSRF-Token ongëlteg.');
            return $this->redirectToRoute('admin_dashboard');
        }

        $em->remove($joke);
        $em->flush();

        $this->addFlash('success', 'Witz geläscht!');
        return $this->redirectToRoute('admin_dashboard');
    }
}
