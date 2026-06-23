<?php

declare(strict_types=1);

namespace AdminApi\Controller\AdminMedia;

use AdminApi\Controller\AbstractController;
use AdminApi\Controller\AdminMedia\Request\ChangeFileRequest;
use AdminApi\Controller\AdminMedia\Request\ChangeFolderRequest;
use AdminApi\Controller\AdminMedia\Request\CreateFileRequest;
use AdminApi\Controller\AdminMedia\Request\CreateFolderRequest;
use AdminApi\Controller\AdminMedia\Request\FolderListRequest;
use AdminApi\Controller\AdminMedia\Response\AdminMediaConfigResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaCurrentFolderResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaFileResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaFolderContentResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaFolderParentResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaFolderResponse;
use AdminApi\Controller\AdminMedia\Response\AdminMediaFolderTreeNodeResponse;
use Common\App\Service\AdminMedia\Data\ChangeFileDto;
use Common\App\Service\AdminMedia\Data\ChangeFolderDto;
use Common\App\Service\AdminMedia\Data\CreateFileDto;
use Common\App\Service\AdminMedia\Data\CreateFolderDto;
use Common\App\Service\AdminMedia\Service as AdminMediaService;
use Common\Infra\Config\Config;
use Common\Shared\Exception\ValidationException;
use Common\Shared\Http\Exception\NotFoundException;
use Common\Shared\Http\Exception\NotAuthorizedException;
use Common\Shared\Http\ResponseFactory;
use Common\Shared\Http\Upload\UploadedFile;
use Common\Shared\Http\Upload\UploadedFileType;
use Common\Shared\ValueObject\Uuid;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Yiisoft\Router\HydratorAttribute\RouteArgument;

final readonly class Controller extends AbstractController
{
    private const MAX_FILE_SIZE = 500 * 1024 * 1024;

    private const PUBLIC_UPLOADS_BASE_URL = 'PUBLIC_UPLOADS_BASE_URL';

    private const ALLOWED_FILE_TYPES = [
        UploadedFileType::Image,
        UploadedFileType::Video,
        UploadedFileType::Audio,
        UploadedFileType::Pdf,
    ];

    public function __construct(
        private ResponseFactory $responseFactory,
        private AdminMediaService $adminMediaService,
        private Config $config,
    ) {}

    public function folders(FolderListRequest $input, ServerRequestInterface $request): ResponseInterface
    {
        $content = $this->adminMediaService->getFolderContent($input->parentId());

        if ($content === null) {
            throw new NotFoundException();
        }

        $currentFolderResponse = $content->currentFolder === null
            ? null
            : AdminMediaCurrentFolderResponse::fromModel($content->currentFolder);

        return $this->responseFactory->ok(new AdminMediaFolderContentResponse(
            currentFolder: $currentFolderResponse,
            parents: array_map(
                fn ($folder) => AdminMediaFolderParentResponse::fromModel($folder),
                $content->parents,
            ),
            folders: array_map(
                fn ($folder) => AdminMediaFolderResponse::fromFolderWithCounters($folder),
                $content->folders,
            ),
            files: array_map(
                fn ($file) => AdminMediaFileResponse::fromModel($file, $this->uploadsBaseUrl($request)),
                $content->files,
            ),
        ));
    }

    public function config(): ResponseInterface
    {
        return $this->responseFactory->ok(new AdminMediaConfigResponse(
            maxFileSize: self::MAX_FILE_SIZE,
            supportedExtensions: UploadedFile::supportedExtensions(self::ALLOWED_FILE_TYPES),
        ));
    }

    public function folderTree(): ResponseInterface
    {
        return $this->responseFactory->ok(array_map(
            fn ($folder) => AdminMediaFolderTreeNodeResponse::fromDto($folder),
            $this->adminMediaService->getFolderTree(),
        ));
    }

    public function upload(#[RouteArgument] string $id, ServerRequestInterface $request): ResponseInterface
    {
        $file = $this->adminMediaService->getFile(new Uuid($id, field: 'id'));

        if ($file === null) {
            throw new NotFoundException();
        }

        if (!$file->isPublic() && $this->user($request) === null) {
            throw new NotAuthorizedException();
        }

        $resource = $this->adminMediaService->getFileResource($file);

        if ($resource === null) {
            throw new NotFoundException();
        }

        return $this->responseFactory->resourceFile(
            resource: $resource,
            fileName: $file->getOriginalName()->value(),
            contentType: $file->getMimeType()->value(),
            inline: true,
        );
    }

    public function createFolder(CreateFolderRequest $input, ServerRequestInterface $request): ResponseInterface
    {
        return $this->responseFactory->created(AdminMediaFolderResponse::fromModel(
            $this->adminMediaService->createFolder(new CreateFolderDto(
                parentId: $input->parentId(),
                name: $input->name(),
                createdBy: $this->mustUser($request)->getId(),
            )),
        ));
    }

    public function changeFolder(ChangeFolderRequest $input, #[RouteArgument] string $id): ResponseInterface
    {
        $changed = $this->adminMediaService->changeFolder(new ChangeFolderDto(
            id: new Uuid($id, field: 'id'),
            name: $input->name(),
        ));

        if (!$changed) {
            throw new NotFoundException();
        }

        return $this->responseFactory->noContent();
    }

    public function createFile(CreateFileRequest $input, ServerRequestInterface $request): ResponseInterface
    {
        $uploadedFile = $request->getUploadedFiles()['file'] ?? null;

        if (!$uploadedFile instanceof UploadedFileInterface) {
            throw new ValidationException(messageKey: 'upload.file_required', field: 'file');
        }

        return $this->responseFactory->created(AdminMediaFileResponse::fromModel(
            model: $this->adminMediaService->createFile(new CreateFileDto(
                folderId: $input->folderId(),
                name: $input->name(),
                file: new UploadedFile(
                    file: $uploadedFile,
                    maxSize: self::MAX_FILE_SIZE,
                    allowedTypes: self::ALLOWED_FILE_TYPES,
                ),
                isPublic: $input->isPublic(),
                createdBy: $this->mustUser($request)->getId(),
            )),
            baseUrl: $this->uploadsBaseUrl($request),
        ));
    }

    public function changeFile(
        ChangeFileRequest $input,
        #[RouteArgument] string $id,
    ): ResponseInterface {
        $changed = $this->adminMediaService->changeFile(new ChangeFileDto(
            id: new Uuid($id, field: 'id'),
            folderId: $input->folderId(),
            name: $input->name(),
            isPublic: $input->isPublic(),
        ));

        if (!$changed) {
            throw new NotFoundException();
        }

        return $this->responseFactory->noContent();
    }

    public function deleteFile(#[RouteArgument] string $id): ResponseInterface
    {
        if (!$this->adminMediaService->deleteFile(new Uuid($id, field: 'id'))) {
            throw new NotFoundException();
        }

        return $this->responseFactory->noContent();
    }

    public function deleteFolder(#[RouteArgument] string $id): ResponseInterface
    {
        if (!$this->adminMediaService->deleteFolder(new Uuid($id, field: 'id'))) {
            throw new NotFoundException();
        }

        return $this->responseFactory->noContent();
    }

    private function uploadsBaseUrl(ServerRequestInterface $request): string
    {
        return $this->config->string(self::PUBLIC_UPLOADS_BASE_URL, $this->baseUrl($request));
    }
}
