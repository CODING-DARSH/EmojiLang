import threading
import requests
import time
import random

URL = 'https://emojilang-backend.onrender.com/run'

# Different codes to simulate real users
TEST_CODES = [
    '''
x = 0
for i in range(100):
    x += i
print(x)
''',
    '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)
print(factorial(10))
''',
    '''
nums = [5, 3, 8, 1, 9, 2]
nums.sort()
print(nums)
print(max(nums))
print(min(nums))
''',
    '''
for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
''',
    '''
d = {}
words = "the cat sat on the mat the cat"
for w in words.split():
    if w in d:
        d[w] += 1
    else:
        d[w] = 1
print(d)
'''
]

# ── Stats tracking ──
stats = {
    'total':    0,
    'success':  0,
    'failed':   0,
    'timeouts': 0,
    'times':    []
}
stats_lock = threading.Lock()

# ── Duration and users ──
DURATION_SECONDS = 60  # 1 minute
NUM_USERS        = 100   # simultaneous users — change this

stop_flag = threading.Event()

def user_worker(user_id):
    while not stop_flag.is_set():
        code = random.choice(TEST_CODES)
        start = time.time()
        try:
            response = requests.post(
                URL,
                json={'code': code},
                timeout=10
            )
            elapsed = round(time.time() - start, 2)
            data = response.json()

            with stats_lock:
                stats['total'] += 1
                stats['times'].append(elapsed)
                if data.get('exitCode') == 0:
                    stats['success'] += 1
                    print(f"✅ User {user_id:02d} → {elapsed}s")
                else:
                    stats['failed'] += 1
                    print(f"❌ User {user_id:02d} → {elapsed}s → {data.get('stderr','')[:50]}")

        except requests.exceptions.Timeout:
            elapsed = round(time.time() - start, 2)
            with stats_lock:
                stats['total']    += 1
                stats['timeouts'] += 1
                stats['times'].append(elapsed)
            print(f"⏱️  User {user_id:02d} → TIMEOUT after {elapsed}s")

        except Exception as e:
            elapsed = round(time.time() - start, 2)
            with stats_lock:
                stats['total']  += 1
                stats['failed'] += 1
                stats['times'].append(elapsed)
            print(f"💥 User {user_id:02d} → ERROR after {elapsed}s → {e}")

        # Wait 2-4 seconds before next request (simulates typing time)
        time.sleep(random.uniform(2, 4))

# ── START ──
print(f"🚀 Load test starting — {NUM_USERS} users for {DURATION_SECONDS} seconds")
print(f"🎯 Target: {URL}")
print("─" * 60)

threads = []
for i in range(NUM_USERS):
    t = threading.Thread(target=user_worker, args=(i+1,))
    t.daemon = True
    threads.append(t)

for t in threads:
    t.start()

# Run for 1 minute then stop
time.sleep(DURATION_SECONDS)
stop_flag.set()

for t in threads:
    t.join(timeout=15)

# ── RESULTS ──
print("\n" + "─" * 60)
print("📊 LOAD TEST RESULTS")
print("─" * 60)
print(f"Duration:        {DURATION_SECONDS}s")
print(f"Concurrent users:{NUM_USERS}")
print(f"Total requests:  {stats['total']}")
print(f"✅ Success:       {stats['success']}")
print(f"❌ Failed:        {stats['failed']}")
print(f"⏱️  Timeouts:      {stats['timeouts']}")

if stats['times']:
    avg = round(sum(stats['times']) / len(stats['times']), 2)
    fastest = round(min(stats['times']), 2)
    slowest = round(max(stats['times']), 2)
    success_rate = round((stats['success'] / stats['total']) * 100, 1)
    print(f"⚡ Avg response:  {avg}s")
    print(f"🏎️  Fastest:       {fastest}s")
    print(f"🐢 Slowest:       {slowest}s")
    print(f"📈 Success rate:  {success_rate}%")

print("─" * 60)

if stats['times']:
    if success_rate >= 95:
        print("🟢 VERDICT: Handles this load perfectly")
    elif success_rate >= 80:
        print("🟡 VERDICT: Manageable but some slowness")
    elif success_rate >= 60:
        print("🟠 VERDICT: Struggling — reduce users or upgrade")
    else:
        print("🔴 VERDICT: Cannot handle this load — upgrade needed")