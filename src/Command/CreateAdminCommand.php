<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\Admin;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Creates or updates an admin user (Interactive & Secure)',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::OPTIONAL, 'The admin email address')
            ->addArgument('password', InputArgument::OPTIONAL, 'The plain password');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $email = $this->resolveEmail($input, $io);
            $password = $this->resolvePassword($input, $io);
        } catch (\InvalidArgumentException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        $admin = $this->entityManager->getRepository(Admin::class)->findOneBy(['email' => $email]);

        if ($admin instanceof Admin) {
            $io->note('Admin already exists. Updating password...');
        } else {
            $admin = new Admin();
            $admin->setEmail($email);
            $admin->setRoles(['ROLE_ADMIN']);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($admin, $password);
        $admin->setPassword($hashedPassword);

        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $io->success(sprintf('Admin %s is ready. You can now log in.', $email));

        return Command::SUCCESS;
    }

    private function resolveEmail(InputInterface $input, SymfonyStyle $io): string
    {
        /** @var string|null $email */
        $email = $input->getArgument('email');

        if ($email !== null && $email !== '') {
            $email = trim($email);

            if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                throw new \InvalidArgumentException('Invalid email format provided for argument "email".');
            }

            return $email;
        }

        return $io->ask(
            'Please enter the admin email address',
            null,
            static function (?string $value): string {
                $email = trim((string) $value);

                if ($email === '') {
                    throw new \RuntimeException('Email cannot be empty.');
                }

                if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                    throw new \RuntimeException('Please enter a valid email address.');
                }

                return $email;
            }
        );
    }

    private function resolvePassword(InputInterface $input, SymfonyStyle $io): string
    {
        /** @var string|null $password */
        $password = $input->getArgument('password');

        if ($password !== null && $password !== '') {
            return $password;
        }

        if ($password === '') {
            throw new \InvalidArgumentException('Password argument cannot be empty.');
        }

        return $io->askHidden(
            'Please enter the password (hidden)',
            static function (?string $value): string {
                $password = (string) $value;

                if ($password === '') {
                    throw new \RuntimeException('Password cannot be empty.');
                }

                return $password;
            }
        );
    }
}
