import requests

BASE_URL = 'http://api.soundcloud.com'
CLIENT_ID = 'ce8f07daeb00017dc254362a3f083b22'


def get_comments(tracks):
    comment_dict = {}
    for track in tracks:
        url = '{}/comments?'.format(BASE_URL)
        params = {
            'client_id': CLIENT_ID,
            'track_id': track['id'],
            'limit': 200,
        }
        payload = requests.get(url, params=params)
        comments = payload.json()
        if isinstance(comments, dict):
            print(comments.get('errors'))
            continue
        for comment in comments:
            comment_dict[comment['id']] = comment
    return comment_dict


def get_tracks(offset=0):
    url = '{}/tracks?'.format(BASE_URL)
    params = {
        'client_id': CLIENT_ID,
        'order': 'hotness',
        'filter': 'downloadable',
        'limit': 200,
        'offset': offset,
    }
    payload = requests.get(url, params=params)
    tracks = payload.json()
    filtered_tracks = filter_tracks(tracks)
    track_dict = {}
    for track in filtered_tracks:
        track_dict[track['id']] = track
    return track_dict


def filter_tracks(tracks):
    for track in tracks:
        if track['downloadable'] and track['commentable']:
            yield track
