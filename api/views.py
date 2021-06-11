from rest_framework import generics, serializers, status
from rest_framework import response
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=self.request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data["guest_can_pause"]
            votes_to_skip = serializer.data["votes_to_skip"]

            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.votes_to_skip = votes_to_skip
                room.guest_can_pause = guest_can_pause
                room.save(update_fields=["votes_to_skip", "guest_can_pause"])
                self.request.session["room_code"] = room.code
            else:
                room = Room(
                    votes_to_skip=votes_to_skip,
                    guest_can_pause=guest_can_pause,
                    host=host,
                )
                room.save()
                self.request.session["room_code"] = room.code
                print("\n\n\n" + self.request.session["room_code"])
                print("session_key=" + self.request.session.session_key)
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data["is_host"] = request.session.session_key == room[0].host
                return Response(data, status.HTTP_200_OK)
            return Response(
                {"Room not found": "Invalid Room Code"}, status.HTTP_404_NOT_FOUND
            )
        return Response(
            {"Bad request": "Code parameter not found in request"},
            status.HTTP_400_BAD_REQUEST,
        )


class JoinRoom(APIView):
    lookup_url_kwarg = "code"

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get("code")
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                self.request.session["room_code"] = room[0].code
                return Response(
                    {
                        "Joinend to Room": "You are Joined to room with room code="
                        + str(code)
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"Bad Request": "Room Code is not found in database"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"Bad Request": "Room Code is not found in request parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):

            self.request.session.create()

        code = self.request.session.get("room_code")

        data = {"code": code}
        print("\n\n\n" + str(data))
        print("\n\n\n session_key user in room=" + self.request.session.session_key)
        return JsonResponse(
            data,
            status=status.HTTP_200_OK,
        )


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_key = self.request.session.session_key
            query_set = Room.objects.filter(host=host_key)
            if len(query_set) > 0:
                room = query_set[0]
                room.delete()
            return Response(
                {"Message:Room is deleted"},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"Bad Request": "Room Code Not Found"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            code = serializer.data.get("code")
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response(
                    {
                        "Bad Request": "Room Not Found",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            else:
                room = queryset[0]
                host = self.request.session.session_key
                if room.host != host:
                    return Response(
                        {
                            "message": "you are not authorize user to change room settings"
                        },
                        status=status.HTTP_401_UNAUTHORIZED,
                    )

                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
            return Response(
                {"message": "Success"},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"Bad Request": "not valid request"},
            status=status.HTTP_400_BAD_REQUEST,
        )
