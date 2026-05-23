#!/bin/bash

set -e

IMAGE_NAME="purse-backend"
DOCKERHUB_IMAGE="aliyura/purse-backend"
TAG="latest"

echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo "Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${TAG} ${DOCKERHUB_IMAGE}:${TAG}

echo "Pushing image to Docker Hub..."
docker push ${DOCKERHUB_IMAGE}:${TAG}

echo "Docker image pushed successfully: ${DOCKERHUB_IMAGE}:${TAG}"