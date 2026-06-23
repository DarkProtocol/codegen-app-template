<?php

declare(strict_types=1);

namespace Console\Commands\AdminUser;

use Common\App\Models\Enum\AdminUserRole;
use Common\App\Service\AdminUser\Data\CreateDto;
use Common\App\Service\AdminUser\Service as AdminUserService;
use Common\Shared\Exception\ValidationException;
use Common\Shared\ValueObject\Email;
use Common\Shared\ValueObject\NewPassword;
use Common\Shared\ValueObject\NullableText;
use Common\Shared\ValueObject\Text;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Throwable;
use Yiisoft\Yii\Console\ExitCode;

final class CreateCommand extends Command
{
    public function __construct(
        private readonly AdminUserService $adminUserService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Creates an admin user.')
            ->addArgument('email', InputArgument::REQUIRED, 'Admin user email.')
            ->addArgument('password', InputArgument::REQUIRED, 'Admin user password.')
            ->addArgument('role', InputArgument::REQUIRED, 'Role: admin|editor.')
            ->addArgument('firstName', InputArgument::REQUIRED, 'Admin user first name.')
            ->addArgument('lastName', InputArgument::OPTIONAL, 'Admin user last name.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $adminUser = $this->adminUserService->create(new CreateDto(
                email: new Email((string) $input->getArgument('email'), field: 'email'),
                firstName: new Text((string) $input->getArgument('firstName'), field: 'firstName'),
                lastName: new NullableText(
                    $input->getArgument('lastName') === null ? null : (string) $input->getArgument('lastName'),
                ),
                password: new NewPassword((string) $input->getArgument('password'), field: 'password'),
                role: AdminUserRole::tryFrom(mb_strtolower((string) $input->getArgument('role'))),
            ));
        } catch (ValidationException $e) {
            $io->error($e->getMessage());
            return ExitCode::DATAERR;
        } catch (Throwable $e) {
            $io->error($e->getMessage());
            return ExitCode::UNSPECIFIED_ERROR;
        }

        $io->success(sprintf('Admin user %s created.', $adminUser->getId()->value()));
        return ExitCode::OK;
    }
}
