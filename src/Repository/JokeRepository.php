<?php

namespace App\Repository;

use App\Entity\Joke;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class JokeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Joke::class);
    }

    public function findRandom(): ?Joke
    {
        $count = $this->count([]);
        if ($count === 0) {
            return null;
        }

        $offset = random_int(0, $count - 1);

        return $this->createQueryBuilder('j')
            ->setFirstResult($offset)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
