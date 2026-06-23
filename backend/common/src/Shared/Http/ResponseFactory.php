<?php

declare(strict_types=1);

namespace Common\Shared\Http;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Yiisoft\DataResponse\ResponseFactory\DataResponseFactoryInterface;
use Yiisoft\Http\Status;

final readonly class ResponseFactory
{
    public function __construct(
        private DataResponseFactoryInterface $dataResponseFactory,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
    ) {
    }

    public function ok(array|object|null $data = null): ResponseInterface
    {
        return $this->dataResponseFactory->createResponse($data)
            ->withStatus(Status::OK);
    }

    public function created(array|object|null $data = null): ResponseInterface
    {
        return $this->dataResponseFactory->createResponse($data)
            ->withStatus(Status::CREATED);
    }

    public function noContent(): ResponseInterface
    {
        return $this->responseFactory->createResponse(Status::NO_CONTENT);
    }

    public function file(string $content, string $fileName, bool $inline = false): ResponseInterface
    {
        return $this->resourceFile(
            resource: $this->streamFactory->createStream($content)->detach(),
            fileName: $fileName,
            contentType: 'application/pdf',
            inline: $inline,
        );
    }

    /**
     * @param resource $resource
     */
    public function resourceFile($resource, string $fileName, string $contentType, bool $inline = false): ResponseInterface
    {
        $disposition = $inline ? 'inline' : 'attachment';

        return $this->responseFactory->createResponse(Status::OK)
            ->withHeader('Content-Type', $contentType)
            ->withHeader(
                'Content-Disposition',
                sprintf('%s; filename="%s"', $disposition, addslashes($fileName))
            )
            ->withBody($this->streamFactory->createStreamFromResource($resource));
    }
}
