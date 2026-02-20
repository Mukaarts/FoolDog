<?php

namespace App\DataFixtures;

use App\Entity\Admin;
use App\Entity\Joke;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Default admin user
        $admin = new Admin();
        $admin->setEmail('admin@fooldog.lu');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'FoolDog2026!'));
        $manager->persist($admin);

        // Jokes
        $jokes = [
            ['emoji' => "\u{1F43E}", 'content' => 'Jeder Moien réift de Bauer: "FOOL, komm hier!" — D\'Noperen denken, hien huet e Problem mat sengem Kierper.'],
            ['emoji' => "\u{1F3C6}", 'content' => 'Beim Hondesconcours gewënnt Fool den éischte Präis. Den Owend: "Mäi Fool ass de Bescht!" — D\'Jury schéngt komesch.'],
            ['emoji' => "\u{1F3BE}", 'content' => '"FOOL, fetch!" — Den Tierarzt freet sech ob de Besëtzer Hëllef brauch.'],
            ['emoji' => "\u{1F319}", 'content' => 'Mëtternuecht, Fënster op: "FOOOOOL, komm eran!" — D\'Noperen ruffen d\'Polizei.'],
            ['emoji' => "\u{1F6C1}", 'content' => '"Fool brauch e Bad" — säit dem Dag kuckt de Friseur komisch wann hien d\'Woolz hëlt.'],
            ['emoji' => "\u{1F4F8}", 'content' => '"Kuckt mol mäi Fool!" — Gesi wou de Finger weist, ier Dir lacht.'],
            ['emoji' => "\u{1F415}", 'content' => 'D\'Mamm rifft: "Komm iessen, de Fool waart op dech!" — De Jong gëtt rout a seet näischt.'],
            ['emoji' => "\u{1F3C3}", 'content' => '"Fool ass eraus gelaaf!" — D\'Noperin hält séier hir Kanner zréck.'],
            ['emoji' => "\u{1F385}", 'content' => 'Bréif un de Kleeschen: "Ech wëll datt de Fool gesond bleift." — D\'Enseignante schéckt en heem mat enger Notiz.'],
            ['emoji' => "\u{1F602}", 'content' => '"Fool schléift bei mir am Bett" — Dono gëtt d\'Dëschgespreech séier ganz roueg.'],
        ];

        foreach ($jokes as $data) {
            $joke = new Joke();
            $joke->setEmoji($data['emoji']);
            $joke->setContent($data['content']);
            $joke->setAuthor('FoolDog');
            $manager->persist($joke);
        }

        $manager->flush();
    }
}
