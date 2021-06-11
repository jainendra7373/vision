from django.shortcuts import render


def index(request, *args, **kwargs):
    print(
        "index-->session_key="
        + (request.session.session_key if request.session.session_key else "none")
    )  #####################################################
    return render(request, "frontend/index.html")
