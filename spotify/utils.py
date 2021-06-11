from django.http import response
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post
from .credentials import CLIENT_ID, CLIENT_SECRET, URL


def get_token_from_db(session_id):

    users = SpotifyToken.objects.filter(user=session_id)
    if users:
        user = users[0]
        return user
    else:
        return None


def update_or_create_tokens(
    session_id, access_token, refresh_token, token_type, expires_in
):
    user = get_token_from_db(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    if user:
        user.access_token = access_token
        user.refresh_token = refresh_token
        user.token_type = token_type
        user.expires_in = expires_in

        user.save(
            update_fields=["access_token", "refresh_token", "token_type", "expires_in"]
        )
    else:
        user = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            token_type=token_type,
        )
        user.save()


def is_user_authenticated(session_id):

    user = get_token_from_db(session_id)

    if user:
        expiry = user.expires_in
        if expiry <= timezone.now():

            refresh_spotify_tokens(session_id)

        return True
    return False


def refresh_spotify_tokens(session_id):
    refresh_token = get_token_from_db(session_id).refresh_token
    print(
        "\n\n\n utils-->refresh_spotify_tokens session key=" + session_id
    )  ##########################
    response = post(
        URL.get("api-token"),
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    expires_in = response.get("expires_in")
    token_type = response.get("token_type")
    #    refresh_token = response.get("refresh_token")

    update_or_create_tokens(
        session_id, access_token, refresh_token, token_type, expires_in
    )
