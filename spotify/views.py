from django.http import response
from django.shortcuts import render, redirect
import requests
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPES, URL
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import update_or_create_tokens, is_user_authenticated


class AuthUrl(APIView):
    def get(self, request, format=None):
        url = (
            Request(
                "GET",
                URL.get("auth"),
                params={
                    "scope": SCOPES.get("spotify_connect"),
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "redirect_uri": REDIRECT_URI,
                    "response_type": "code",
                },
            )
            .prepare()
            .url
        )
        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")
    state = request.GET.get("state")
    print(
        "\n\n\n spotify_callback before redirect spotify session key="
        + (request.session.session_key if request.session.session_key else "none")
    )  ################################################################################################
    response = post(
        URL.get("api-token"),
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
            "code": code,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")
    refresh_token = response.get("refresh_token")
    error = response.get("error")
    if not request.session.exists(request.session.session_key):
        request.session.create()
    print(
        "\n\n\n spotify_callback after redirect spotify session key="
        + request.session.session_key
    )  ##################################################################################################
    update_or_create_tokens(
        session_id=request.session.session_key,
        access_token=access_token,
        refresh_token=refresh_token,
        token_type=token_type,
        expires_in=expires_in,
    )
    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_user_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)
