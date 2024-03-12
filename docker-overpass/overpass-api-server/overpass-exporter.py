import prometheus_client
import time
import subprocess

UPDATE_PERIOD = 5000
OVERPASS_SPACE = prometheus_client.Gauge('overpass_memory_space',
                                          'overpass_memory_space',
                                          ['state'])
OVERPASS_TIME_UNITS = prometheus_client.Gauge('overpass_time_units',
                                              'overpass_time_units',
                                              ['state'])
OVERPASS_REQUESTS = prometheus_client.Gauge('overpass_requests',
                                              'overpass_requests',
                                              ['state'])
OVERPASS_CONNECTIONS = prometheus_client.Gauge('overpass_connections',
                                              'overpass_connections',
                                              ['state'])
OVERPASS_RATE_LIMIT = prometheus_client.Gauge('overpass_rate_limit',
                                              'overpass_rate_limit')
OVERPASS_BASE_VERSION = prometheus_client.Info('overpass_version',
                                                'overpass version')

DISPATCHER_PASS = "/overpass/bin/dispatcher"

if __name__ == '__main__':
  prometheus_client.start_http_server(9246)
  
while True:
  res = subprocess.run([DISPATCHER_PASS, "--osm-base", "--status"], capture_output=True, text=True)
  for l in res.stdout.splitlines():
    if "Total available space" in l:
      OVERPASS_SPACE.labels("available").set(l.split(":")[1])
    elif "Total claimed space" in l:
      OVERPASS_SPACE.labels("claimed").set(l.split(":")[1])
    elif "Average claimed space" in l:
      OVERPASS_SPACE.labels("average").set(l.split(":")[1])
    elif "Total available time units" in l:
      OVERPASS_TIME_UNITS.labels("available").set(l.split(":")[1])
    elif "Total claimed time units" in l:
      OVERPASS_TIME_UNITS.labels("claimed").set(l.split(":")[1])
    elif "Average claimed time units" in l:
      OVERPASS_TIME_UNITS.labels("average").set(l.split(":")[1])
    elif "Counter of started requests" in l:
      OVERPASS_REQUESTS.labels("started").set(l.split(":")[1])
    elif "Counter of finished requests" in l:
      OVERPASS_REQUESTS.labels("finished").set(l.split(":")[1])
    elif "Counter of load shedded requests" in l:
      OVERPASS_REQUESTS.labels("load_shedded ").set(l.split(":")[1])
    elif "Counter of rate limited requests" in l:
      OVERPASS_REQUESTS.labels("rate_limited ").set(l.split(":")[1])
    elif "Counter of as duplicate rejected requests" in l:
      OVERPASS_REQUESTS.labels("duplicate rejected").set(l.split(":")[1])
    elif "Number of not yet opened connections" in l:
      OVERPASS_CONNECTIONS.labels("not_yet_opened").set(l.split(":")[1])
    elif "Number of connected clients" in l:
      OVERPASS_CONNECTIONS.labels("connected").set(l.split(":")[1])
    elif "Rate limit" in l:
      OVERPASS_RATE_LIMIT.set(l.split(":")[1])

  with open('/overpass/db/osm_base_version') as f:
    base_version = f.read().strip().replace('\\', '')
  with open('/overpass/db/area_version') as f:
    area_version = f.read().strip()
  OVERPASS_BASE_VERSION.info({'base': base_version, 'area': area_version})

  time.sleep(UPDATE_PERIOD)